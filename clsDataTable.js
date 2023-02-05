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

        this.container = options.container;

        this.overflowWidth = options.overflowWidth || false;

        this.table;

        this.init();
    }

    init()
    {
    }

    buildEmptyTable()
    {
        this.table = document.createElement('div');
        this.table.classList.add('table', 'box-border', 'w-full', 'border', 'border-slate');

        this.container.append(this.table);
    }

    update(jsonData)
    {
        this.buildEmptyTable();

        if(typeof jsonData === 'undefined' || !jsonData)
        {
            console.log('clsDataTable.update: jsonData is empty');
            jsonData = [];
        }

        if(typeof jsonData === 'string')
        {
            jsonData = JSON.parse(jsonData);
        }
        
        if(jsonData && jsonData.length <= 1)
        {
            console.log('clsDataTable.update: jsonData is empty');
        }
        else
        {
            jsonData.forEach((row) => 
            {
                let rowEl = document.createElement('div');
                rowEl.classList.add('table-row');

                row.forEach((col) =>
                {
                    let colEl = document.createElement('div');
                    let key = Object.keys(col)[0];
                    colEl.innerHTML = col[key];
                    colEl.classList.add('table-cell', 'p-1', 'border', 'border-slate');
                    rowEl.append(colEl);
                });
                this.table.append(rowEl);
            });
        }
    }
}