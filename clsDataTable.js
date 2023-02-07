/**
 * Data Table Class that accepts JSON Data to display in a Table
 * @constructor
 * @param {object} options - Data Table options object
 * @param {object} options.keyMap - Options for columns and header title, hidden, render
 */
/**
 * @namespace
 * @property {object}  options                  - options object
 * @property {object}  options.keyMap           - Keymap for setting title, functions to render value
 * @property {string}  options.keyMap.title     - Set the column title
 * @property {object}  options.keyMap.render    - Function passed in to manipulate the cell
 * @property {number}  options.keyMap.hidden    - Hidden column still in html on page
 */
class clsDataTable
{
    constructor(options)
    {
        if(typeof options === 'undefined')
        {
            console.error('clsDataTable - options must be defined');
        }

        if(typeof options.container === 'undefined')
        {
            console.error('clsDataTable - options.container must defined');
        }

        this.sort = true;
        if(typeof options.sort !== 'undefined')
        {
            this.sort = options.sort;
        }
        this.sortVal = 1;

        this.keyMap = options.keyMap || null;

        this.container = options.container; // Element where table rests

        this.jsonDataOriginal; // Original data Passed In
        this.jsonData; // Modified data by this class and/or user action

        this.table; // Main table object
        this.filterUI;
        this.filterBtns; // Filter buttons
        this.filters = {}; // Map of keys and filter values
        this.keys; // Keys defined for json object

        this.symbols = {}; //SVG drawings for UI 

        this.initialize();
    }

    initialize()
    {
        this.filterUI = document.createElement('div');
        this.filterUI.classList.add('block', 'absolute', 'bg-greyLite', 'z-9999', 'border', 'rounded', 'w-32', 'h-32', 'max-h-52', 'overflow-y-auto', 'top-10', 'left-32');
        this.filterUI.innerHTML = '<h4>Filters</h4>';
        this.container.append(this.filterUI);

        this.symbols.disk = '';
        this.symbols.filter = '';
        this.symbols.paperclip = '';
        this.symbols.printer = '';
        this.symbols.expand = '';
        this.symbols.magnify = '';

        let dataStr = 'data:image/svg+xml;charset=utf-8,';

        Object.keys(this.symbols).forEach((key) => 
        {
            this.symbols[key] = document.createElement('img');
            this.symbols[key].src = dataStr;
            this.symbols[key].classList.add('w-5', 'h-5', 'mr-3', 'inline-block', 'align-bottom');
        });

        this.symbols.disk.src         +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.835" height="2.835" fill="DimGray"><path d="M2.83.789l-.51-.77A.038.038 0 002.287 0H.091C.042 0 0 .044 0 .101v2.633c0 .057.041.102.091.102h2.653c.051 0 .092-.045.092-.102V.81C2.835.801 2.833.792 2.83.789zM.315.21c0-.028.024-.05.052-.05H2.22c.027 0 .057.021.057.05l-.004.844a.055.055 0 01-.053.052H.367a.052.052 0 01-.052-.052V.21zm2.203 2.327c-.001.031-.026.063-.06.063H.375c-.031 0-.059-.027-.059-.063v-1.02a.06.06 0 01.059-.061h2.083c.03 0 .063.026.063.061l-.003 1.02z"/><path d="M2.185 2.152H.652c-.051 0-.092.027-.092.061 0 .035.041.063.092.063h1.533c.051 0 .09-.024.09-.063 0-.034-.041-.061-.09-.061zM2.185 1.712H.652c-.051 0-.092.026-.092.06 0 .036.041.062.092.062h1.533c.051 0 .09-.025.09-.062 0-.033-.039-.06-.09-.06z"/></svg>';
        this.symbols.expand.src       +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.834" height="2.834" fill="DimGray"><path d="M2.711 0h-.693a.124.124 0 00-.124.123l.285.287-.343.344a.17.17 0 00-.053.125.179.179 0 00.303.125L2.429.66l.282.284A.124.124 0 002.834.82V.125A.124.124 0 002.711 0zM2.709 1.893l-.289.29-.351-.351a.177.177 0 00-.25 0 .174.174 0 000 .248l.351.351-.279.278c0 .067.057.123.123.123h.695a.125.125 0 00.125-.123v-.692a.124.124 0 00-.125-.124zM.66.408L.944.125A.124.124 0 00.82.002H.125A.125.125 0 000 .125v.692C0 .886.057.94.125.94L.41.656l.354.354c.033.035.079.052.125.052s.09-.017.125-.052a.177.177 0 000-.249L.66.408zM.873 1.713l-.463.465-.287-.287A.123.123 0 000 2.015v.696c0 .068.056.123.123.123h.693a.123.123 0 00.123-.123l-.281-.283.465-.465a.179.179 0 000-.25.179.179 0 00-.25 0z"/></svg>';
        this.symbols.filter.src       +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.835" height="2.835" fill="DimGray"><path d="M2.803.042A.087.087 0 002.729 0H.104a.08.08 0 00-.071.042.084.084 0 000 .084L1.075 1.93l-.002.04v.517c0 .041.023.08.061.1l.469.237a.116.116 0 00.051.012.114.114 0 00.112-.113V1.97c0-.014 0-.026-.002-.04L2.807.126a.103.103 0 00-.004-.084z"/></svg>';
        this.symbols.paperclip.src    +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.834" height="2.834" fill="DimGray"><path d="M2.068.395L.534 1.931a.29.29 0 000 .414.292.292 0 00.412 0L2.477.815A.483.483 0 002.58.294a.493.493 0 00-.258-.259.496.496 0 00-.366.001.456.456 0 00-.154.104L.247 1.694a.672.672 0 00-.001.946h.001c.13.131.301.195.472.195a.664.664 0 00.473-.195l1.561-1.561a.097.097 0 000-.137.096.096 0 00-.138 0L1.054 2.503a.472.472 0 01-.671 0 .472.472 0 01.001-.67L1.938.278a.28.28 0 01.308-.061.28.28 0 01.176.262.305.305 0 01-.021.108.286.286 0 01-.063.091L.809 2.21a.095.095 0 01-.07.027.102.102 0 01-.067-.027.092.092 0 01-.029-.068c0-.025.008-.051.028-.07L2.208.536a.097.097 0 000-.137.095.095 0 00-.14-.004z"/></svg>';
        this.symbols.printer.src      +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.835" height="2.835" fill="DimGray"><path d="M2.986.962H2.59V1.39H.243V.963h-.396c-.117 0-.211.074-.211.164V2.106h.51v-.312h.158v.946c0 .054.041.096.094.096h2.039a.094.094 0 00.095-.096v-.946h.154v.311H3.2v-.979c-.002-.089-.097-.164-.214-.164zM2.09 2.373H.761c-.043 0-.08-.027-.08-.063s.037-.062.08-.062H2.09c.043 0 .079.026.079.062s-.036.063-.079.063zm0-.453H.761c-.043 0-.08-.028-.08-.062s.037-.062.08-.062H2.09c.043 0 .079.027.079.062 0 .034-.036.062-.079.062zm.818-.672a.092.092 0 01-.092-.092c0-.049.041-.09.092-.09s.091.041.091.09a.09.09 0 01-.091.092z"/><path d="M2.53.633a.11.11 0 00-.026-.067L1.965.029A.09.09 0 001.898 0h-1.5a.095.095 0 00-.096.095v1.236h2.229L2.53.633zM1.92.611L1.919.156l.477.455H1.92z"/></svg>';
        this.symbols.magnify.src      +=   '<svg xmlns="http://www.w3.org/2000/svg" width="2.834" height="2.834" fill="Gray"><path d="M.291 1.693a.995.995 0 001.354.047l.179.18a.169.169 0 00.038.186l.677.679a.177.177 0 00.244 0 .176.176 0 000-.246l-.677-.676a.17.17 0 00-.186-.038l-.18-.18A.99.99 0 001.694.291a.99.99 0 00-1.403 0 .99.99 0 000 1.402zM.16.992A.83.83 0 011.582.404a.835.835 0 01-.59 1.422A.835.835 0 01.16.992z"/><path d="M.463 1.523A.748.748 0 10.994.244a.746.746 0 00-.75.748c0 .2.077.389.219.531zm.645.059a.04.04 0 01-.022.006.639.639 0 01-.5-.187.64.64 0 01-.163-.637.06.06 0 01.03-.033A.053.053 0 01.494.73a.062.062 0 01.01.003.055.055 0 01.031.062v.006a.514.514 0 00.131.517.521.521 0 00.406.152.057.057 0 01.06.045l.002.007-.001.022-.002.006-.006.015a.135.135 0 01-.017.017z"/></svg>';
    }

    /**
    * @method
    * @name setJsonData
    * @param {string/object} jsonData accepts string or object
    * @description set this to change data table
    */
    setJsonData(jsonData)
    {
        this.jsonDataOriginal = jsonData;
        this.jsonData = jsonData;

        this.update();
    }

    buildFilters()
    {
        this.filterBtns = document.createElement('div');
        this.filterBtns.classList.add('w-full', 'block', 'text-xs', 'p-1', 'h-7');

        this.filterBtns.append(this.symbols.disk);
        this.filterBtns.append(this.symbols.filter);
        this.filterBtns.append(this.symbols.paperclip);
        this.filterBtns.append(this.symbols.printer);
        this.filterBtns.append(this.symbols.expand);

        this.symbols.filter.addEventListener('click', () =>
        {
            Object.keys(this.filters).forEach((key) =>
            {
                let filterContainer = document.createElement('div');
                filterContainer.classList.add('block');
                filterContainer.innerHTML = `${key}: `;
                let input = document.createElement('input');
                input.type = 'text';
                input.classList.add('w-full');
                input.classList.add('bg-transparent', 'inline-block', 'h-7', 'border', 'border-slate', 'rounded-md', 'sm:text-sm', 'focus:border-greyLite', 'p-1', 'pl-6', 'shadow-sm', 'placeholder-slate', 'focus:outline-none');
                filterContainer.append(input);

                this.filterUI.append(filterContainer);

                //this.filters[key]
                //console.log(key)
            });
            //this.filterUI
            //this.filters
            //this.keys
            
        });

        let searchBox = document.createElement('div');
        searchBox.classList.add('float-right', 'h-7', 'mb-1');
        let searchInput = document.createElement('input');
        searchInput.classList.add('bg-transparent', 'inline-block', 'h-7', 'border', 'border-slate', 'rounded-md', 'sm:text-sm', 'focus:border-greyLite', 'p-1', 'pl-6', 'shadow-sm', 'placeholder-slate', 'focus:outline-none');
        searchInput.placeholder = 'Search';
        searchInput.style.backgroundImage = "url('" + this.symbols.magnify.src + "')";
        searchInput.style.backgroundPositionY = 'center';
        searchInput.style.backgroundPositionX = '2px';
        searchInput.style.backgroundRepeat = 'no-repeat';
        searchInput.style.backgroundSize = '1rem';
        searchInput.addEventListener('keyup', () =>
        {
            this.searchJsonData(searchInput.value);
            
        });
        searchInput.addEventListener('change', () =>
        {
            this.searchJsonData(searchInput.value);
            
        });
        searchBox.append(searchInput);
        let searchCancelBtn = document.createElement('button');
        searchCancelBtn.classList.add('inline-block', 'border', 'rounded', 'text-greyDark', 'bg-greyLite', 'h-full', 'ml-1', 'w-5', 'font-bold');
        searchCancelBtn.innerHTML = 'X';
        searchCancelBtn.addEventListener('click', () =>
        {
            searchInput.value = '';
            Array.from(this.table.querySelectorAll('.table-row-group .table-row')).forEach((row) =>
            {
                row.classList.remove('hidden');
            });
        });
        searchBox.append(searchCancelBtn);

        this.filterBtns.append(searchBox);

        this.container.append(this.filterBtns);
    }

    buildEmptyTable()
    {
        if(this.table)
        {
            this.table.remove();
        }
        if(!this.filterBtns)
        {
            this.buildFilters();
        }

        this.table = document.createElement('div');
        this.table.classList.add('table', 'box-border', 'w-full', 'border', 'border-slate');

        this.container.append(this.table);
    }

    revertJsonData()
    {
        this.jsonData = this.jsonDataOriginal;

        this.update();
    }

    sortJsonData(key)
    {
        this.jsonData.sort((a, b) => 
        {
            let sortVal = -1;

            if (a[key] < b[key]) 
            {
                return -1 * this.sortVal;
            }
            if (a[key] > b[key]) 
            {
                return 1 * this.sortVal;
            }
            return 0;
        });

        this.buildTable();
    }

    searchJsonData(val)
    {
        Array.from(this.table.querySelectorAll('.table-row-group .table-row')).forEach((row) =>
        {
            let found = false;
            Array.from(row.querySelectorAll('.table-cell')).forEach((cell) =>
            {
                if(cell.innerHTML.indexOf(val) > -1)
                {
                    found = true;
                }
            });

            if(!found)
            {
                row.classList.add('hidden');
            }
            else
            {
                row.classList.remove('hidden');
            }
        });
    }

    update()
    {
        if(typeof this.jsonData === 'undefined' || !this.jsonData)
        {
            console.log('clsDataTable.update: jsonData is empty');
            this.jsonData = [];
        }

        if(typeof this.jsonData === 'string')
        {
            this.jsonData = JSON.parse(this.jsonData);
        }
        
        if(this.jsonData && this.jsonData.length <= 1)
        {
            console.log('clsDataTable.update: jsonData is empty');
        }
        else
        {
            //If Keys/Headers do not exist create them
            this.jsonData = this.jsonData.map((row) =>
            {
                let i = 0;
                var obj = new Object();
                row = row.forEach((col) =>
                {
                    if(typeof col === 'string')
                    {
                        obj[i] = col;

                        i++;
                    }
                    else
                    {
                        obj[Object.keys(col)[0]] = col[Object.keys(col)[0]];
                        i++;
                    }
                });

                return obj;
            });

            // Parse Keys
            this.keys = [];
            Object.keys(this.jsonData[0]).forEach((key) =>
            {
                this.keys.push(key);

                this.filters[key] = '';
                
                // console.log(this.filters);
            });
        }

        this.buildTable();
    }

    buildTable()
    {
        this.buildEmptyTable();

        if(typeof this.keys === 'undefined' || !this.keys || this.keys.length === 0)
        {
            this.table.innerHTML = `<h1 class="bg-greyLite text-center text-xl font-bold p-4">No Results</h1>`;
            this.table.classList.remove('table');
            return;
        }

        // Table Header
        let header = document.createElement('div');
        header.classList.add('table-header-group', 'bg-greyLite');
        let headerRow = document.createElement('div');
        headerRow.classList.add('table-row');
        let colCtr=0;
        this.keys.forEach((key) =>
        {
            let col = document.createElement('div');
            col.classList.add('table-cell', 'p-1', 'border', 'border-grey', 'border-slate');

            // KeyMap Title
            if(this.keyMap && this.keyMap[key] && this.keyMap[key].title)
            {
                col.innerHTML = this.keyMap[key].title;
            }
            else if(this.keyMap && this.keyMap[colCtr] && this.keyMap[colCtr].title)
            {
                col.innerHTML = this.keyMap[colCtr].title;
            }
            else
            {
                col.innerHTML = key;
            }

            // KeyMap Hidden
            if(this.keyMap && this.keyMap[key] && this.keyMap[key].hidden)
            {
                col.classList.add('hidden');
            }
            else if(this.keyMap && this.keyMap[colCtr] && this.keyMap[colCtr].hidden)
            {
                col.classList.add('hidden');
            }

            if(this.sort)
            {
                let sortUI = document.createElement('span');
                sortUI.classList.add('float-right', 'text-xs', 'cursor-pointer', 'text-greyDark');
                
                let up = document.createElement('div');
                up.classList.add('block', 'leading-none');
                up.innerHTML = '▲';
                let down = document.createElement('div');
                down.classList.add('block', 'leading-none');
                down.innerHTML = '▼';

                sortUI.append(up);
                sortUI.append(down);

                sortUI.setAttribute('sortDirection', 'down');
                sortUI.addEventListener('click', () =>
                {
                    this.sortJsonData(key);

                    this.sortVal = this.sortVal * -1 ;
                });
                col.append(sortUI);
            }

            headerRow.append(col);
            colCtr++;
        });
        header.append(headerRow);
        this.table.append(header);

        let rowGroup = document.createElement('div');
        rowGroup.classList.add('table-row-group');

        this.jsonData.forEach((row) => 
        {
            let rowEl = document.createElement('div');
            rowEl.classList.add('table-row');

            let colCtr=0;
            Object.keys(row).forEach((rowKey) =>
            {
                var col = new Object();
                col.key = row[rowKey];

                let key;
                let colEl = document.createElement('div');
                colEl.classList.add('table-cell', 'p-1', 'border', 'border-greyLite', 'border-slate');
                if(typeof col === 'object')
                {
                    key = Object.keys(col)[0];
                    colEl.innerHTML = col[key];
                }
                else
                {
                    console.error('clsDataTable: buildTable - jsonData columns should be an object');
                }

                // KeyMap Render Function
                if(this.keyMap && this.keyMap[key] && this.keyMap[key].render)
                {
                    colEl.innerHTML = this.keyMap[key].render(colEl.innerHTML);
                }
                else if(this.keyMap && this.keyMap[colCtr] && this.keyMap[colCtr].render)
                {
                    colEl.innerHTML = this.keyMap[colCtr].render(colEl.innerHTML);
                }
                
                // KeyMap Hidden
                if(this.keyMap && this.keyMap[key] && this.keyMap[key].hidden)
                {
                    colEl.classList.add('hidden');
                }
                else if(this.keyMap && this.keyMap[colCtr] && this.keyMap[colCtr].hidden)
                {
                    colEl.classList.add('hidden');
                }

                rowEl.append(colEl);
                
                colCtr++;
            });
            rowGroup.append(rowEl);
        });

        this.table.append(rowGroup);
    }
}