var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start();
});

function start() {
    connection.query(`SELECT item_id, product_name, price FROM products`, function (err, res) {
        if (err) throw err;
        res.forEach(function (item) {
            console.log(`ID:      ${item.item_id} 
Product: ${item.product_name}
Price:   ${item.price}
--------------------------------------------`)
        })
        customerPrompt();
    })
}

function customerPrompt() {
    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "Please enter item ID.",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "input",
            name: "units",
            message: "How many units would you like to buy?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (response) {
        connection.query(`SELECT * FROM products WHERE item_id= ${response.itemID}`, function (err, res) {
            if (err) throw err;
            if ((response.units - res[0].stock_quantity) <= 0) {
                buy(res[0], response);
            } else {
                console.log(`Out of stock.`);
                customerPrompt();
            }
        })
    })
};

function buy(res, response) {
    console.log(`Thank you for buying ${res.product_name}. Total: $${res.price * response.units}`)
    connection.query(`UPDATE products SET ? WHERE ?`,
        [
            {
                stock_quantity: res.stock_quantity - response.units
            },
            { item_id: res.item_id }
        ]);
    endConnection();
}
function endConnection() {
    connection.end();
};