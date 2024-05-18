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
    let randoTextArr = ["Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit", "Quisque eu lorem elementum", "Etiam in consequat", "Pellentesque", "tincidunt ex non est tempus", "vulputate", "feugiat", "fermentum", "massa", "porttitor", "libero", "tincidunt feugiat in vulputate nisl", 1, 2, 0, 4, 5, 'a1', 'a2', 'a4'];
    randoTextArr.sort();

    const rand = (max) => 
    {
        let num = Math.floor(Math.random() * randoTextArr.length); //from 0 to 10
        return num;
    };

    let arr = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');

    let rows = [];
    for(let x=0; x<numRows; x++)
    {
        let columns = {};
        if(dType === 'bare')
        {
            columns = [];
        }
        for(let y=0; y<numCols; y++)
        {
            if(dType === 'bare')
            {
                //No Keys just arrays of arrays
                //[["/Date(1682622250243)/",333,"SupportLead","Dave","","Davis",false,3377665]]
                columns.push(randoTextArr[rand(randoTextArr.length -1)]);
            }
            else if(dType === 'keyed')
            {
                let val = randoTextArr[rand(randoTextArr.length)];
                columns[arr[rand(arr.length)] + y] = val;
            }
        }
        //console.log(columns)
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