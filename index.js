const exec = require('child_process').exec;
const csv = require('csv-parser');
const fs = require('fs');
const { parse } = require('path');
let UserInputTime = process.argv[3];

let userInputDate = process.argv[2];
const results = [];
let stockNames = new Array();
let lineNum = 0;
let totalProfitLoss = 0;
let filePath = "/Users/vishwasmani/Desktop/Personal/Code/ProfitLossSnapShot/TestFiles/" + userInputDate + ".txt";
 
// line num start from last line vs first line
    // sed $'s/[^[:print:]\t]//g' 063021-cool.csv > 063021.txt
// test txt conversion

// compare times
// fix algorithmmmmm 

// removing extra characters in file 


let relative_path = "TestFiles/" + userInputDate + ".txt"
exec(' sed -i \'\' $\'s/[^[:print:]\t]//g\' ' + relative_path + ' > TestFiles/temp.txt', (e, stdout, stderr) => {

    console.log(stdout);

});




fs.createReadStream(filePath)
    .pipe(
        csv(['date', 'time', 'stock', 'action', 'quantity', 'price'])
    )
    .on('data', function (dataRow) {
        results.push(dataRow);
    })
    .on('end', function() {

        
        createArrayOfObjects();
       
        var fields = UserInputTime.split(':');
        var hour = parseInt(fields[0]);
        var minute = parseInt(fields[1]);

        profitLossLogic(hour, minute, (data) => {
            
            printFunc();
        })
        

          
    })



const profitLossLogic = (hour, minute, callback) => {


    while(true) {
        var time = results[lineNum].time;
        var timeSplits = time.split(':');

        var currentHour = parseInt(timeSplits[0]);
        var currentMinute = parseInt(timeSplits[1]);
        
        if(currentHour > hour) {
            break;
        }
        
        if(currentHour == hour && currentMinute >= minute) {
            break;
        }


        var stockIndex;

        for(var i = 0; i < stockNames.length; i++) {
            if(stockNames[i].name == results[lineNum].stock) {
                stockIndex = i;
            } 
        }

        stockNames[stockIndex].modified = 'yes';


        if(results[lineNum].action == 'B') {
            // console.log("goes here")
            // console.log(results[lineNum].quantity);
            stockNames[stockIndex].boughtTotal += parseFloat(results[lineNum].price) * parseFloat(results[lineNum].quantity);
            stockNames[stockIndex].positionHeld +=  parseInt(results[lineNum].quantity);
            
        } 
        if(results[lineNum].action == 'S') {
            stockNames[stockIndex].soldTotal += parseFloat(results[lineNum].price) * parseFloat(results[lineNum].quantity);
            stockNames[stockIndex].positionHeld -=  parseInt(results[lineNum].quantity);
           ;
        } 

        if(stockNames[stockIndex].positionHeld == 0) {
            let netProfit = stockNames[stockIndex].soldTotal - stockNames[stockIndex].boughtTotal;
            stockNames[stockIndex].totalProfitLossPerStock += netProfit;
            // console.log("sold total: " + stockNames[stockIndex].soldTotal + " - bought total: " + stockNames[stockIndex].boughtTotal + " = Net Profit " + netProfit);
            // console.log("Total Profit Loss " + stockNames[stockIndex].totalProfitLossPerStock);
            stockNames[stockIndex].soldTotal = 0;
            stockNames[stockIndex].boughtTotal = 0;
            
        }
   

        if(lineNum == results.length - 1) {
            break;
        }
        lineNum++;

    }

    
  
    callback(stockNames);
} 


const createArrayOfObjects = () => {
    for(var i = 0; i < results.length; i++) {

        temp = 0;

        for(var v = 0; v < stockNames.length; v++) {
            if(stockNames[v].name == results[i].stock) {
                temp = 1;
                
            }
        }

        if(temp == 0){
            const newObject = { name:results[i].stock, positionHeld: 0, totalProfitLossPerStock: 0, soldTotal: 0, boughtTotal: 0, modified: 'no' }
            stockNames.push(newObject);
        }
    }

}


const printFunc = () => {
    console.log("Stock  Realized");
            for(var i = 0; i < stockNames.length; i++) {

                
                if(stockNames[i].modified == 'yes') {

                    if(stockNames[i].positionHeld > 0) {

                        if(stockNames[i].totalProfitLossPerStock < 0) {
                            console.log(stockNames[i].name + " $(" + (Math.round(stockNames[i].totalProfitLossPerStock * 100) / 100)*-1  + ") " +  stockNames[i].positionHeld + " shares are being held");
                        } else {
                            console.log(stockNames[i].name + " $" + Math.round(stockNames[i].totalProfitLossPerStock * 100) / 100 + " " + stockNames[i].positionHeld + " shares are being held");
                        }

                    } else {


                        if(stockNames[i].totalProfitLossPerStock < 0) {
                            console.log(stockNames[i].name + " $(" + (Math.round(stockNames[i].totalProfitLossPerStock * 100) / 100)*-1 + ")" );
                        } else {
                            console.log(stockNames[i].name + " $" + Math.round(stockNames[i].totalProfitLossPerStock * 100) / 100);
                        }

                    }
                    
                    totalProfitLoss +=  stockNames[i].totalProfitLossPerStock;
                   
                }
            }

            if(totalProfitLoss >= 0) {
                console.log("Total $" + (Math.round(totalProfitLoss * 100) / 100));
            } else {
                console.log("Total $(" + (Math.round(totalProfitLoss * 100) / 100)*-1 + ")");
            }

            

}




