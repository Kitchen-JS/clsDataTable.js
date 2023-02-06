/**
 * A functions that generates a random json data set
 * @constructor
 * @param {number} numCols - Number of columns to generate
 * @param {number} numRows - Number of rows to generate
 * @param {string} dType - 'bare' = no keys ["a", "b"], 'keyed' = {"a":"fubar", "b":"fubar"}
 * @param {string} rType - 'string' = textual string, 'json' = json object
 */
function GenerateJsonData(numCols, numRows, dType, rType)
{
    let randoTextArr = ["Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit", "Quisque eu lorem elementum", "Etiam in consequat", "Pellentesque", "tincidunt ex non est tempus", "vulputate", "feugiat", "fermentum", "massa", "porttitor", "libero", "tincidunt feugiat in vulputate nisl"];
    randoTextArr.sort();

    const rand = () => 
    {
        return Math.floor(Math.random() * 12); //from 0 to 10
    };

    let arr = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');

    let rows = [];
    for(let x=0; x<numRows; x++)
    {
        let columns = [];
        for(let y=0; y<numCols; y++)
        {
            if(dType === 'bare')
            {
                let r = rand();
                let val = randoTextArr[r];
                columns.push(val);
            }
            else if(dType === 'keyed')
            {
                var obj = new Object();
                let r = rand();
                obj[arr[y]] = randoTextArr[r];
                columns.push(obj);
            }
        }
        rows.push(columns);
    }

    // rType: string, json
    if(rType === 'string')
    {
        return JSON.stringify(rows);
    }
    if(rType === 'json')
    {
        return rows;
    }
}