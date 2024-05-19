class clsDataTable 
{
  /**
  * @constructor
  * @param {object} options - Data Table options object
  * @param {object} options.keyMap - Options for columns and header title, hidden, render
  * @namespace
  * @property {object}  options                  - options object
  * @property {object}  options.keyMap           - Keymap for setting title, functions to render value
  * @property {string}  options.keyMap.title     - Set the column title
  * @property {object}  options.keyMap.render    - Function passed in to manipulate the cell
  * @property {number}  options.keyMap.hidden    - Hidden column still in html on page
  * @property {number}  options.keyMap.remove    - Remove column from dataset
  * @property {number}  options.keyMap.order    - column order
  */
  constructor( options ) 
  {
    if ( typeof options === "undefined" ) 
    {
      console.error( "clsDataTable - options must be defined" );
    }

    if ( typeof options.container === "undefined" ) 
    {
      console.error( "clsDataTable - options.container must defined" );
    }

    if ( typeof options.altRowColor === "undefined" )
    {
      options.altRowColor = true;
    }

    if ( typeof options.sort === "undefined" )
    {
      options.sort = true;
    }
    this.sortVal = 1;

    if ( typeof options.freezeHeader === "undefined" )
    {
      options.freezeHeader = false;
    }

    if ( typeof options.includeFooter === "undefined" )
    {
      options.includeFooter = false;
    }

    if ( typeof options.refreshFunction === "undefined" )
    {
      options.refreshFunction = () =>
      {
        this.setJsonData( this.jsonDataOriginal );
      };
    }

    if ( typeof options.hideButtons === "undefined" )
    {
      options.hideButtons = false;
    }

    this.options = options || {};

    this.keyMap = options.keyMap || null;

    this.container = options.container; // Element where table rests
    this.id;

    this.jsonDataOriginal; // Original data Passed In
    this.jsonData; // Modified data by this class and/or user action

    this.table; // Main table object
    this.filterUI;
    this.filterBtns; // Filter buttons
    this.filters = {}; // Map of keys and filter values
    this.keys; // Keys defined for json object

    this.sortObj = {}; //{Key: Direction:}

    this.events = {}; //Events that span the class but need to be removed after various instances in different locations within the class

    this.symbols = {}; //SVG drawings for UI

    this.minWidth = "380px";

    this.initialize();
  }

  initialize ()
  {
    this.id = this.randomID();
    this.container.id = this.id || this.randomID();
    this.container.classList.add( "clsDataTableContainer" );

    this.container.style.minWidth = this.minWidth;

    this.filterUI = document.createElement( "div" );
    this.filterUI.classList.add( "filterUI", "hidden" );
    this.container.append( this.filterUI );

    this.symbols.filter = "";
    this.symbols.disk = "";
    this.symbols.paperclip = "";
    this.symbols.printer = "";
    this.symbols.expand = "";
    this.symbols.magnify = "";
    this.symbols.refresh = "";

    //let dataStr = "data:image/svg+xml;charset=utf-8,";

    Object.keys( this.symbols ).forEach( ( key ) =>
    {
      this.symbols[key] = document.createElement( "i" );
      //this.symbols[key].src = dataStr;
      this.symbols[key].classList.add( "toolbar-button" );
    } );

    this.symbols.filter.classList.add( 'kfi-filter' );
    this.symbols.disk.classList.add( 'kfi-disk' );
    this.symbols.paperclip.classList.add( 'kfi-paperclip' );
    this.symbols.printer.classList.add( 'kfi-printer' );
    this.symbols.expand.classList.add( 'kfi-expand' );
    this.symbols.magnify.classList.add( 'kfi-magnify' );
    this.symbols.refresh.classList.add( 'kfi-refresh' );

    this.symbols.paperclip.classList.add( "paperclip" );
    this.symbols.refresh.classList.add( "refresh" );

    // Hide until finished
    this.symbols.filter.classList.add( "hidden" );
    if ( this.options.hideButtons )
    {
      this.symbols.filter.classList.add( "hidden" );
      this.symbols.paperclip.classList.add( "hidden" );
      this.symbols.disk.classList.add( "hidden" );
      this.symbols.printer.classList.add( "hidden" );
      this.symbols.expand.classList.add( "hidden" );
      this.symbols.magnify.classList.add( "hidden" );
      this.symbols.refresh.classList.add( "hidden" );
    }

    // var parser = new DOMParser();
    // let svgData = parser.parseFromString(this.symbols.paperclip.src, "image/svg+xml");

    this.events.filterUIClickOffWindowEvent = () =>
    {
      this.filterUI.classList.add( "hidden" );
      window.removeEventListener( "click", this.events.filterUIClickOffWindowEvent );
      this.filterUI.removeEventListener( "click", this.events.filterUIClickOffUIEvent );
    };
    this.events.filterUIClickOffUIEvent = ( e ) =>
    {
      e.stopPropagation();
    };
  }

  /**
   * @method
   * @name setJsonData
   * @param {string/object} jsonData accepts string or object
   * @description set this to change data table
   */
  setJsonData ( jsonData )
  {
    this.jsonDataOriginal = jsonData;

    // If JSON is a string parse it
    if ( typeof this.jsonData === "string" )
    {
      this.jsonData = JSON.parse( this.jsonData );
    }

    //Unkeyed dataset array of arrays we will need to assign keys
    if ( Array.isArray( jsonData[0] ) )
    {
      let reformedJsonData = [];
      let numCols = jsonData[0].length;
      let numColsChanged = false;
      jsonData.forEach( ( row ) =>
      {
        if ( numCols !== row.length )
        {
          console.error( "Number of columns changed" );
          numColsChanged = true;
        }
        let newRow = {};
        let colCtr = 0;
        row.forEach( ( col ) =>
        {
          newRow["col" + colCtr] = col;
          colCtr++;
        } );
        reformedJsonData.push( newRow );
      } );
      jsonData = reformedJsonData;
    }

    // Handle column deletions from option KeyMap remove
    jsonData.forEach( ( row ) =>
    {
      Object.keys( this.keyMap ).forEach( ( key ) =>
      {
        if ( typeof this.keyMap[key].remove !== "undefined" && this.keyMap[key].remove )
        {
          delete row[key.toString()];
        }
      } );
    } );

    this.jsonData = jsonData;
    if ( typeof this.jsonData === "undefined" || !this.jsonData || this.jsonData.length < 1 )
    {
      console.log( "clsDataTable.update: jsonData is empty" );
      this.jsonData = [];
    } else
    {
      // Parse Keys
      this.keys = [];
      Object.keys( this.jsonData[0] ).forEach( ( key ) =>
      {
        this.keys.push( key );

        this.filters[key] = {};

        this.filters[key].value = "";
        this.filters[key].show = true;
      } );
    }
    this.update();
  }

  buildFilters ()
  {
    let searchBox = document.createElement( "div" );
    let searchInput = document.createElement( "input" );
    let searchCancelBtn = document.createElement( "button" );

    this.filterBtns = document.createElement( "div" );
    this.filterBtns.classList.add( "filterBtns" );
    this.filterBtns.style.minWidth = this.minWidth;

    this.filterBtns.append( this.symbols.filter );
    this.filterBtns.append( this.symbols.expand );
    this.filterBtns.append( this.symbols.disk );
    this.filterBtns.append( this.symbols.paperclip );
    this.filterBtns.append( this.symbols.printer );
    this.filterBtns.append( this.symbols.refresh );

    this.symbols.disk.addEventListener( "click", () =>
    {
      this.handleExport();
    } );

    this.symbols.paperclip.addEventListener( "click", ( e ) =>
    {
      let data = `${this.convert( "tab" )}`;
      navigator.clipboard.writeText( data );

      this.symbols.paperclip.classList.add( "pushed" );
      //this.symbols.paperclip

      setTimeout( () =>
      {
        this.symbols.paperclip.classList.remove( "pushed" );
      }, 1200 );
    } );

    this.symbols.expand.setAttribute( "expanded", false );
    this.symbols.expand.addEventListener( "click", () =>
    {
      if ( this.symbols.expand.getAttribute( "expanded" ) == "false" )
      {
        this.symbols.expand.setAttribute( "expanded", true );
        this.container.requestFullscreen();
      } else
      {
        document.exitFullscreen();
        this.symbols.expand.setAttribute( "expanded", false );
      }
    } );

    this.symbols.printer.addEventListener( "click", () =>
    {
      this.print();
    } );

    this.symbols.filter.addEventListener( "click", () =>
    {
      this.filterUIPopup();
    } );

    this.symbols.refresh.addEventListener( "click", () =>
    {
      searchCancelBtn.dispatchEvent( new Event( "click" ) );

      this.options.refreshFunction();

      this.symbols.refresh.classList.add( "rotating" );

      setTimeout( () =>
      {
        this.symbols.refresh.classList.remove( "rotating" );
      }, 500 );
    } );

    searchBox.classList.add( "searchBox" );
    searchInput.classList.add( "searchInput" );
    searchInput.placeholder = "Search";
    searchInput.style.backgroundImage = "url('" + this.symbols.magnify.src + "')";
    searchInput.style.backgroundPositionY = "center";
    searchInput.style.backgroundPositionX = "2px";
    searchInput.style.backgroundRepeat = "no-repeat";
    searchInput.style.backgroundSize = "1rem";
    searchInput.addEventListener( "keyup", () =>
    {
      this.searchJsonData( searchInput.value );
    } );
    searchInput.addEventListener( "change", () =>
    {
      this.searchJsonData( searchInput.value );
    } );
    searchBox.append( searchInput );
    searchCancelBtn.classList.add( "searchCancelBtn" );
    searchCancelBtn.innerHTML = "X";
    searchCancelBtn.addEventListener( "click", () =>
    {
      searchInput.value = "";
      Array.from( this.table.querySelectorAll( ".table-row-group .table-row" ) ).forEach( ( row ) =>
      {
        row.classList.remove( "hidden" );
      } );
    } );
    searchBox.append( searchCancelBtn );

    this.filterBtns.append( searchBox );

    this.container.append( this.filterBtns );
  }

  buildEmptyTable ()
  {
    if ( this.table )
    {
      this.table.remove();
    }
    if ( !this.filterBtns )
    {
      this.buildFilters();
    }

    this.table = document.createElement( "div" );
    this.table.classList.add( "table" );

    this.container.append( this.table );
  }

  revertJsonData ()
  {
    this.setJsonData( this.jsonDataOriginal );
  }

  sortJsonData ( key )
  {
    const compareStrings = ( a, b ) =>
    {
      // Assuming you want case-insensitive comparison
      a = a.toString().toLowerCase();
      b = b.toString().toLowerCase();

      if ( this.sortObj.direction === "down" )
      {
        return a < b ? -1 : a > b ? 1 : 0;
      } else
      {
        return a < b ? 1 : a > b ? -1 : 0;
      }
    };

    //ToDo:// Address sort issue
    this.jsonData.sort( ( a, b ) =>
    {
      return compareStrings( a[key], b[key] );
    } );

    this.buildTable( this.jsonData );
  }

  applyFilters ()
  {
    //console.log(this.filters)

    //this.jsonData
    //this.filters
    //console.log(this.keys)
    //console.log(this.filters)

    let newJsonData = JSON.parse( JSON.stringify( this.jsonData ) );

    newJsonData = newJsonData.map( ( row ) =>
    {
      // Check for column removal
      this.keys.forEach( ( key ) =>
      {
        if ( !this.filters[key].show )
        {
          delete row[key];
          return;
        }
      } );
      return row;
    } );

    // Apply filters on rows based on cell value
    // this.keys.forEach((key) =>
    // {
    //     if(this.filters[key].value.length > 0)
    //     {
    //         newJsonData = newJsonData.map((row) =>
    //         {
    //             let found = false;
    //             if(typeof row[key] !== 'undefined' && row[key].toString().indexOf(this.filters[key].value))
    //             {
    //                 found = true;
    //             }

    //             if(found)
    //             {
    //                 return row;
    //             }
    //         });
    //     }
    // });

    //console.log(newJsonData);

    this.buildTable( newJsonData );
  }

  searchJsonData ( val )
  {
    Array.from( this.table.querySelectorAll( ".table-row-group .table-row" ) ).forEach( ( row ) =>
    {
      let found = false;

      Array.from( row.querySelectorAll( ".table-cell" ) ).forEach( ( cell ) =>
      {
        if ( cell.innerHTML.indexOf( val ) > -1 )
        {
          found = true;
        }
      } );

      if ( !found )
      {
        row.classList.add( "hidden" );
      } else
      {
        row.classList.remove( "hidden" );
      }
    } );
  }

  update ()
  {
    if ( this.jsonData && this.jsonData.length <= 1 )
    {
      console.log( "clsDataTable.update: jsonData is empty" );
    }
    else
    {
      // Parse Keys
      this.keys = [];
      Object.keys( this.jsonData[0] ).forEach( ( key ) =>
      {
        this.keys.push( key );
        if ( typeof this.filters[key].value === "undefined" ||
          !this.filters[key].value
        )
        {
          this.filters[key].value = "";
        }
        if ( typeof this.filters[key].show === "undefined" )
        {
          this.filters[key].show = true;
        }
      } );
    }

    this.buildTable( this.jsonData );
  }

  buildTable ( jsonData )
  {
    this.buildEmptyTable();

    if (
      typeof this.keys === "undefined" ||
      !this.keys ||
      this.keys.length === 0
    )
    {
      this.table.innerHTML = `<h1 class="">&nbsp;</h1>
            <div class="table-row-group">
                <div class="table-row">
                    <div class="no-results">No Results</div>
                </div>
            </div>`;
      return;
    }

    // Table Header
    let header = document.createElement( "div" );
    header.classList.add( "table-header-group" );
    if ( this.options.freezeHeader )
    {
      header.classList.add( "sticky-header" );
    }
    let headerRow = document.createElement( "div" );
    headerRow.classList.add( "table-row" );

    let removedKeys = [];
    this.keys.map( ( key, i ) =>
    {
      // sort keys by order Title
      if ( this.keyMap && this.keyMap[key] )
      {
        if ( typeof this.keyMap[key].order === "number" )
          this.keys.move( i, this.keyMap[key].order );
      }
    } );
    let colCtr = 0;
    this.keys.forEach( ( key ) =>
    {
      if ( !this.filters[key].show )
      {
        return;
      }

      let col = document.createElement( "div" );
      col.classList.add( "table-cell" );

      // KeyMap Title
      if ( this.keyMap && this.keyMap[key] && this.keyMap[key].title )
      {
        col.innerHTML = this.keyMap[key].title;
      } else if (
        this.keyMap &&
        this.keyMap[colCtr] &&
        this.keyMap[colCtr].title
      )
      {
        col.innerHTML = this.keyMap[colCtr].title;
      } else
      {
        col.innerHTML = key;
      }

      // KeyMap Hidden
      if ( this.keyMap && this.keyMap[key] && this.keyMap[key].hidden )
      {
        col.classList.add( "hidden" );
      } else if (
        this.keyMap &&
        this.keyMap[colCtr] &&
        this.keyMap[colCtr].hidden
      )
      {
        col.classList.add( "hidden" );
      }

      if ( this.options.sort )
      {
        let sortUI = document.createElement( "span" );
        sortUI.classList.add( "column-sort" );

        let up = document.createElement( "div" );
        up.innerHTML = "▲";
        let down = document.createElement( "div" );
        down.innerHTML = "▼";

        sortUI.append( up );
        sortUI.append( down );

        //sortUI.setAttribute('sortDirection', 'down');
        sortUI.addEventListener( "click", () =>
        {
          //this.sortObj = {}; //{key: direction:}
          if ( typeof this.sortObj.key === "undefined" || !this.sortObj.key )
          {
            this.sortObj.key = key;
            this.sortObj.direction = "down";
          } else if ( this.sortObj.key !== key )
          {
            this.sortObj.key = key;
            this.sortObj.direction = "down";
          } else if ( this.sortObj.direction === "up" )
          {
            this.sortObj.direction = "down";
          } else if ( this.sortObj.direction === "down" )
          {
            this.sortObj.direction = "up";
          }

          this.sortJsonData( key );

          this.sortVal = this.sortVal * -1;
        } );
        col.append( sortUI );
      }

      headerRow.append( col );
      colCtr++;
    } );
    header.append( headerRow );
    this.table.append( header );

    let rowGroup = document.createElement( "div" );
    rowGroup.classList.add( "table-row-group" );

    let rowctr = 0;
    let isEven = ( n ) =>
    {
      return n % 2 == 0;
    };
    let isOdd = ( n ) =>
    {
      return Math.abs( n % 2 ) == 1;
    };

    jsonData.forEach( ( row ) =>
    {
      let rowEl = document.createElement( "div" );
      let rowIndex = "row-" + rowctr;
      rowEl.classList.add( "table-row", rowIndex );

      if ( this.options.altRowColor && rowctr > 0 && isOdd( rowctr ) )
      {
        rowEl.classList.add( "alt-row" );
      }

      if (
        typeof this.options.rowHeight !== "undefined" &&
        this.options.rowHeight
      )
      {
        rowEl.style.height = this.options.rowHeight;
      }
      if (
        typeof this.options.rowHeightMin !== "undefined" &&
        this.options.rowHeightMin
      )
      {
        rowEl.style.minHeight = this.options.rowHeightMin;
      }
      if (
        typeof this.options.rowHeightMax !== "undefined" &&
        this.options.rowHeightMax
      )
      {
        rowEl.style.maxHeight = this.options.rowHeightMax;
      }

      let colCtr = 0;
      let cols = [];
      Object.keys( row ).forEach( ( rowKey ) =>
      {
        var col = new Object();
        col.key = row[rowKey];
        let key;
        let colEl = document.createElement( "div" );
        colEl.classList.add( "table-cell" );
        if ( typeof col === "object" )
        {
          key = Object.keys( col )[0];
          colEl.innerHTML = col[key];
        } else
        {
          console.error(
            "clsDataTable: buildTable - jsonData columns should be an object"
          );
        }
        colEl.key = rowKey;
        // KeyMap Render Function
        if ( this.keyMap && this.keyMap[rowKey] && this.keyMap[rowKey].render )
        {
          let data = colEl.innerHTML;
          colEl.innerHTML = "";

          let val = this.keyMap[rowKey].render( data );
          if ( typeof val === "object" )
          {
            colEl.append( val );
          } else
          {
            colEl.innerHTML = val;
          }
        } else if (
          this.keyMap &&
          this.keyMap[colCtr] &&
          this.keyMap[colCtr].render
        )
        {
          let data = colEl.innerHTML;
          colEl.innerHTML = "";

          let val = this.keyMap[colCtr].render( data );
          if ( typeof val === "object" )
          {
            colEl.append( val );
          } else
          {
            colEl.innerHTML = val;
          }
        }

        //Col Class
        colEl.classList.add( rowKey );

        // KeyMap Hidden
        if ( this.keyMap && this.keyMap[rowKey] && this.keyMap[rowKey].hidden )
        {
          colEl.classList.add( "hidden" );
        } else if (
          this.keyMap &&
          this.keyMap[colCtr] &&
          this.keyMap[colCtr].hidden
        )
        {
          colEl.classList.add( "hidden" );
        }

        //Col Width
        if (
          rowctr === 0 &&
          this.keyMap &&
          this.keyMap[colCtr] &&
          this.keyMap[colCtr].width
        )
        {
          //colEl.style.width = this.keyMap[colCtr].width;
          colEl.style.setProperty(
            "width",
            this.keyMap[colCtr].width,
            "important"
          );
        } else if (
          rowctr === 0 &&
          typeof this.options.colWidth !== "undefined" &&
          this.options.colWidth
        )
        {
          //colEl.style.width = this.options.colWidth;
          colEl.style.setProperty( "width", this.options.colWidth, "important" );
        }
        //min Col Width
        if (
          rowctr === 0 &&
          this.keyMap &&
          this.keyMap[colCtr] &&
          this.keyMap[colCtr].minwidth
        )
        {
          //colEl.style.minWidth = this.keyMap[colCtr].minwidth;
          colEl.style.setProperty(
            "min-width",
            this.keyMap[colCtr].minwidth,
            "important"
          );
        } else if (
          rowctr === 0 &&
          typeof this.options.colWidthMin !== "undefined" &&
          this.options.colWidthMin
        )
        {
          //colEl.style.minwidth = this.options.colWidthMin;
          colEl.style.setProperty(
            "min-width",
            this.options.colWidthMin,
            "important"
          );
        }
        //max Col Width
        if (
          rowctr === 0 &&
          this.keyMap &&
          this.keyMap[colCtr] &&
          this.keyMap[colCtr].maxwidth
        )
        {
          //colEl.style.maxWidth = this.keyMap[colCtr].maxwidth;
          colEl.style.setProperty(
            "max-width",
            this.keyMap[colCtr].maxwidth,
            "important"
          );
        } else if (
          rowctr === 0 &&
          typeof this.options.colWidthMax !== "undefined" &&
          this.options.colWidthMax
        )
        {
          //colEl.style.maxwidth = this.options.colWidthMax;
          colEl.style.setProperty(
            "max-width",
            this.options.colWidthMax,
            "important"
          );
        }
        cols.push( colEl );
        colCtr++;
      } );
      //reorder and append based on order options.
      cols.map( ( col, i ) =>
      {
        if ( this.keyMap && this.keyMap[col.key] )
        {
          if ( typeof this.keyMap[col.key].order === "number" )
            cols.move( i, this.keyMap[col.key].order );
        }
      } );
      cols.forEach( ( col ) => rowEl.appendChild( col ) );
      //append whole row.
      rowGroup.append( rowEl );
      rowctr++;
    } );

    this.table.append( rowGroup );

    if ( this.options.includeFooter )
    {
      let footer = document.createElement( "div" );
      footer.classList.add( "table-header-group" );
      footer.append( headerRow.cloneNode( true ) );
      Array.from( footer.querySelectorAll( "*" ) ).forEach( ( el ) =>
      {
        if ( el.classList.contains( "column-sort" ) )
        {
          el.remove();
        }
      } );
      this.table.append( footer );
    }
  }

  print ()
  {
    // Get all other elements not in same root chain (siblings) in order to hide them
    let parents = [];
    parents.push( this.container.parent );
    let otherElements = [];

    let crawlParentChild = ( el ) =>
    {
      let parent = el.parentNode;
      parents.push( parent );

      let sibling = parent.firstChild;

      while ( sibling )
      {
        if (
          sibling.nodeType === 1 &&
          sibling !== this.container &&
          parents.indexOf( sibling ) <= -1 &&
          !sibling.classList.contains( "hidden" ) &&
          sibling.nodeName !== "SCRIPT"
        )
        {
          otherElements.push( sibling );
        }

        sibling = sibling.nextSibling;
      }

      if ( parent.nodeName !== "BODY" )
      {
        crawlParentChild( parent );
      }
    };

    crawlParentChild( this.container );

    // Hide other elements
    otherElements.forEach( ( el ) =>
    {
      el.classList.add( "hidden" );
    } );

    this.filterBtns.classList.add( "hidden" );

    let colSort = this.table.querySelectorAll( ".column-sort" );

    colSort.forEach( ( col ) =>
    {
      col.classList.add( "hidden" );
    } );

    // unHide other elements
    let afterPrint = ( e ) =>
    {
      otherElements.forEach( ( el ) =>
      {
        el.classList.remove( "hidden" );
      } );

      this.filterBtns.classList.remove( "hidden" );

      colSort.forEach( ( col ) =>
      {
        col.classList.remove( "hidden" );
      } );

      window.removeEventListener( "afterprint", afterPrint );
    };

    window.addEventListener( "afterprint", afterPrint );

    window.print();
  }

  filterUIPopup ()
  {
    Array.from( this.filterUI.querySelectorAll( "*" ) ).forEach( ( el ) =>
    {
      el.remove();
    } );

    let titleRow = document.createElement( "div" );
    titleRow.classList.add( "titleRow" );

    let title = document.createElement( "div" );
    title.classList.add( "title" );
    title.innerHTML = "Filters";
    titleRow.append( title );

    let closeFilterUI = document.createElement( "button" );
    closeFilterUI.classList.add( "close" );
    closeFilterUI.innerHTML = "X";
    closeFilterUI.addEventListener( "click", () =>
    {
      this.filterUI.classList.add( "hidden" );
      setTimeout( () =>
      {
        window.removeEventListener(
          "click",
          this.events.filterUIClickOffWindowEvent
        );
        this.filterUI.removeEventListener(
          "click",
          this.events.filterUIClickOffUIEvent
        );
      }, 500 );
    } );
    titleRow.append( closeFilterUI );

    let clearFilters = document.createElement( "div" );
    clearFilters.classList.add( "w-full" );
    let clearFiltersBtn = document.createElement( "button" );
    clearFiltersBtn.classList.add( "clearFilter" );
    clearFiltersBtn.innerHTML = "Clear Filters";
    clearFiltersBtn.addEventListener( "click", () =>
    {
      this.filterUI.classList.toggle( "hidden" );
      setTimeout( () =>
      {
        window.removeEventListener(
          "click",
          this.events.filterUIClickOffWindowEvent
        );
        this.filterUI.removeEventListener(
          "click",
          this.events.filterUIClickOffUIEvent
        );
      }, 500 );

      this.revertJsonData();
    } );
    clearFilters.append( clearFiltersBtn );
    titleRow.append( clearFilters );

    this.filterUI.append( titleRow );

    let colHeadRow = document.createElement( "div" );
    colHeadRow.classList.add( "colHeadRow" );

    let chrc1 = document.createElement( "div" );
    chrc1.classList.add( "chrc1" );
    chrc1.innerHTML = "Col";
    let chrc2 = document.createElement( "div" );
    chrc2.classList.add( "chrc2" );
    chrc2.innerHTML = "Filter";
    let chrc3 = document.createElement( "div" );
    chrc3.classList.add( "chrc3" );
    chrc3.innerHTML = "Clr";
    let chrc4 = document.createElement( "div" );
    chrc4.classList.add( "chrc4" );
    chrc4.innerHTML = "+/-&nbsp;";

    colHeadRow.append( chrc1, chrc2, chrc3, chrc4 );

    this.filterUI.append( colHeadRow );

    Object.keys( this.filters ).forEach( ( key ) =>
    {
      let filterContainer = document.createElement( "div" );
      filterContainer.classList.add( "filterContainer" );

      let filterRow = document.createElement( "div" );
      filterRow.classList.add( "filterRow" );

      let keyEl = document.createElement( "span" );
      keyEl.classList.add( "keyEl" );
      keyEl.innerHTML = `${key}:&nbsp;`;
      filterRow.append( keyEl );

      let input = document.createElement( "input" );
      input.type = "text";
      input.classList.add( "input", "hidden" );
      input.value = this.filters[key].value;
      input.addEventListener( "keyup", () =>
      {
        this.filters[key].value = input.value;

        this.applyFilters();
      } );
      filterRow.append( input );

      let clear = document.createElement( "button" );
      clear.classList.add( "clear" );
      clear.classList.add( "hidden" );
      clear.innerHTML = "X";
      clear.addEventListener( "click", () =>
      {
        input.value = "";
        this.filters[key].value = "";

        this.applyFilters();
      } );
      filterRow.append( clear );

      let showCol = document.createElement( "input" );
      showCol.type = "checkbox";
      showCol.classList.add( "checkbox" );
      showCol.checked = this.filters[key].show;
      showCol.addEventListener( "change", () =>
      {
        this.filters[key].show = showCol.checked;

        this.applyFilters();
      } );
      filterRow.append( showCol );

      this.filterUI.append( filterRow );

      setTimeout( () =>
      {
        window.addEventListener(
          "click",
          this.events.filterUIClickOffWindowEvent
        );
        this.filterUI.addEventListener(
          "click",
          this.events.filterUIClickOffUIEvent
        );
      }, 800 );
    } );

    this.filterUI.classList.toggle( "hidden" );
  }

  handleExport ()
  {
    let exportUI = document.createElement( "div" );
    exportUI.classList.add( "exportUI" );

    let uiTitleRow = document.createElement( "div" );
    uiTitleRow.classList.add( "uiTitleRow" );

    let uiTitle = document.createElement( "div" );
    uiTitle.classList.add( "uiTitle" );
    uiTitle.innerHTML = "Export";
    uiTitleRow.append( uiTitle );

    let closeUI = document.createElement( "button" );
    closeUI.classList.add( "closeUI" );
    closeUI.innerHTML = "X";
    closeUI.addEventListener( "click", () =>
    {
      exportUI.remove();
    } );
    uiTitleRow.append( closeUI );

    exportUI.append( uiTitleRow );

    let exportCsv = document.createElement( "button" );
    exportCsv.classList.add( "exportCsv" );
    exportCsv.innerHTML = "Download as CSV Comma Delimited";
    exportCsv.addEventListener( "click", () =>
    {
      this.export( "csv" );
      exportUI.remove();
    } );
    exportUI.append( exportCsv );

    let exportTab = document.createElement( "button" );
    exportTab.classList.add( "exportTab" );
    exportTab.innerHTML = "Download as TSV Tab Delimited";
    exportTab.addEventListener( "click", () =>
    {
      this.export( "tab" );
      exportUI.remove();
    } );
    exportUI.append( exportTab );

    let exportJson = document.createElement( "button" );
    exportJson.classList.add( "exportJson" );
    exportJson.innerHTML = "Download as JSON";
    exportJson.addEventListener( "click", () =>
    {
      this.export( "json" );
      exportUI.remove();
    } );
    exportUI.append( exportJson );

    this.container.append( exportUI );
  }

  convert ( type )
  {
    /***** Build JSON Start *****/
    let dataSet = []; // For building dataSet to export as JSON

    let keys = [];
    Array.from(
      this.table.querySelectorAll( ".table-header-group .table-cell" )
    ).forEach( ( headerCell ) =>
    {
      if ( headerCell.classList.contains( "hidden" ) )
      {
        return;
      }

      let val = headerCell.innerHTML;
      val = this.stripHtml( val );
      keys.push( val );
    } );

    Array.from(
      this.table.querySelectorAll( ".table-row-group .table-row" )
    ).forEach( ( row ) =>
    {
      if ( row.classList.contains( "hidden" ) )
      {
        return;
      }

      let rowSet = {};

      let cellCtr = 0;
      Array.from( row.querySelectorAll( ".table-cell" ) ).forEach( ( cell ) =>
      {
        if ( cell.classList.contains( "hidden" ) )
        {
          return;
        }

        cell = this.getHtmlValue( cell );

        rowSet[keys[cellCtr]] = cell; // Add to rowSet for building dataSet to export as JSON

        cellCtr++;
      } );

      dataSet.push( rowSet );
    } );
    /***** Build JSON End *****/

    if ( type === "json" )
    {
      return JSON.stringify( dataSet );
    }

    if ( type === "csv" )
    {
      let csv = ``;
      csv += keys.join( "," ) + `\r\n`;

      dataSet.forEach( ( row ) =>
      {
        let csvRow = ``;

        keys.forEach( ( key ) =>
        {
          csvRow += `"${row[key]}",`;
        } );
        csvRow = csvRow.replace( /,\s*$/, "" );

        csv += csvRow + `\r\n`;
      } );

      return csv;
    }

    if ( type === "tab" )
    {
      let tab = ``;
      tab += keys.join( `\t` ) + `\r\n`;

      dataSet.forEach( ( row ) =>
      {
        let tabRow = ``;

        keys.forEach( ( key ) =>
        {
          tabRow += `"${row[key]}"\t`;
        } );
        tabRow = tabRow.replace( /,\s*$/, "" );

        tab += tabRow + `\r\n`;
      } );

      return tab;
    }
  }

  export ( type )
  {
    let data = "";
    let link = document.createElement( "a" );

    if ( type === "csv" )
    {
      data = "data:text/csv;charset=utf-8,";
      link.setAttribute( "download", "export.csv" );
    }
    if ( type === "tab" )
    {
      data = "data:text/tab-separated-values;charset=utf-8,";
      link.setAttribute( "download", "export.tsv" );
    }
    if ( type === "json" )
    {
      data = "data:application/json;charset=utf-8,";
      link.setAttribute( "download", "export.json" );
    }

    let encodedUri = data + encodeURI( this.convert( type ) );
    link.style.visibility = "hidden";
    link.setAttribute( "href", encodedUri );
    document.body.appendChild( link );
    link.click();
    link.remove();
  }

  getHtmlValue ( cell )
  {
    let value;
    let ndCtr = 0;
    cell.childNodes.forEach( ( nd ) =>
    {
      if ( typeof nd.value != "undefined" )
      {
        value = nd.value;
      }

      ndCtr++;
    } );

    if ( !value )
    {
      value = this.stripHtml( cell.innerHTML );
    }
    return value;
  }

  containsHtmlNode ( cell )
  {
    let x = false;
    cell.childNodes.forEach( ( nd ) =>
    {
      if ( nd.nodeType === 1 )
      {
        x = true;
      }
    } );

    return x;
  }

  stripHtml ( html )
  {
    html = html.replaceAll( /<[^>]*>/g, "" );
    html = html.replace( "▲▼", "" );
    html = html.replace( "▲", "" );
    html = html.replace( "▼", "" );
    return html;
  }

  toBinary ( string )
  {
    const codeUnits = Uint16Array.from(
      { length: string.length },
      ( element, index ) => string.charCodeAt( index )
    );
    const charCodes = new Uint8Array( codeUnits.buffer );

    let result = "";
    charCodes.forEach( ( char ) =>
    {
      result += String.fromCharCode( char );
    } );
    return result;
  }

  randomID ()
  {
    let alphaArr = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(
      ","
    );
    let alphaRandNum = Math.floor( Math.random() * 26 );
    let randoAlpha = alphaArr[alphaRandNum];
    let num = Math.floor( Math.random() * 101 ); //0-100
    let timestamp = Date.now();
    let id = "DT-" + num + randoAlpha + "-" + timestamp;
    return id;
  }
}

Array.prototype.move = function ( from, to )
{
  this.splice( to, 0, this.splice( from, 1 )[0] );
};
