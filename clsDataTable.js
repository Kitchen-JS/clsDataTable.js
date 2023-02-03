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
        if(this.overflowWidth)
        {
            this.container.classList.add('w-max');
        }
        else
        {
            this.container.classList.add('w-fit');
        }

        this.table = document.createElement('div');
        this.table.classList.add('grid', 'grid-flow-row', 'gap-4')

        this.container.append(this.table);
    }

    dummyTable()
    {
        this.table.innerHTML = `<div class="grid grid-cols-5">
            <div>01</div>
            <div>02</div>
            <div>03</div>
            <div>04</div>
            <div>this is long ass column content to see what happens</div>
        </div>
        <div class="grid grid-cols-5">
            <div>01</div>
            <div>What happens now that this content is long and longer and longer</div>
            <div>03</div>
            <div>04</div>
            <div>05</div>
        </div>;`
    }

    addRow()
    {
        let row = document.createElement('div');
        row.classList.add('grid');

        //Need number of columns
        row.classList.add('grid-cols-5');
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
                rowEl.classList.add('grid');
                rowEl.classList.add('grid-cols-' + jsonData[0].length);
                row.forEach((col) =>
                {
                    let colEl = document.createElement('div');
                    let key = Object.keys(col)[0];
                    colEl.innerHTML = col[key];
                    rowEl.append(colEl);
                });
                this.table.append(rowEl);
            });
        }
    }
}

/*
<div class="grid grid-flow-row gap-4">
    <div class="grid grid-cols-5">
        <div>01</div>
        <div>02</div>
        <div>03</div>
        <div>04</div>
        <div>this is long ass column content to see what happens</div>
    </div>
    <div class="grid grid-cols-5">
        <div>01</div>
        <div>What happens now that this content is long and longer and longer</div>
        <div>03</div>
        <div>04</div>
        <div>05</div>
    </div>
</div>
*/