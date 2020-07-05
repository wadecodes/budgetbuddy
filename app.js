var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.setPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calcTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (element) {
            sum += element.value;
        });
        data.total[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, description, value) {
            var newItem, id;
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            if (type === 'inc') {
                newItem = new Income(id, description, value);
            } else {
                newItem = new Expense(id, description, value);
            }
            data.allItems[type].push(newItem);

            return newItem;
        },
        calculateTotal: function () {
            calcTotal('inc');
            calcTotal('exp');
            data.budget = data.total.inc - data.total.exp;
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        deleteItem: function (type, ID) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(ID);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },
        setPercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.setPercentage(data.total.inc);
            });
        },
        getPercentages: function () {
            var percentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return percentages;
        },
        test: function () {
            console.log(data);
        }
    }

})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeList: ".income__list",
        expenseList: ".expenses__list",
        budgetValue: ".budget__value",
        incomeValue: ".budget__income--value",
        expenseValue: ".budget__expenses--value",
        expensePercentage: ".budget__expenses--percentage",
        container: ".container",
        expenseItemPercentage: ".item__percentage",
        month: ".budget__title--month"
    }
    var formatNumber = function (num, type) {
        var int, decimal, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        decimal = numSplit[1];

        if (int.length > 3 && int.length <= 5) {
            int = int.substring(0, int.length - 3) + "," + int.substring(int.length - 3, int.length);
        } else if (int.length > 5) {
            int = int.substring(0, int.length - 5) + "," + int.substring(int.length - 5, int.length - 3) + "," + int.substring(int.length - 3, int.length);
        }
        return ((type === "inc" ? "+" : "-")) + " " + int + "." + decimal;
    }

    var nodeListForEach = function (list, callback) {
        for (i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
   
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
        updateInput: function (newItem, type) {
            var html, newhtml, list;
            if (type === "inc") {
                list = DOMstrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                list = DOMstrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newhtml = html.replace("%id%", newItem.id);
            newhtml = newhtml.replace("%description%", newItem.description);
            newhtml = newhtml.replace("%value%", formatNumber(newItem.value, type));
            document.querySelector(list).insertAdjacentHTML("beforeend", newhtml);
        },
        clearField: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            arrFields = Array.prototype.slice.call(fields);
            arrFields.forEach((element, index, array) => {
                element.value = "";
            });
            arrFields[0].focus();
        },
        updateBudgetUI: function (budget) {
            var type = (budget.budget >= 0) ? "inc" : "exp";
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(budget.budget, type);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(budget.totalInc, "inc");
            document.querySelector(DOMstrings.expenseValue).textContent = formatNumber(budget.totalExp, "exp");
            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.expensePercentage).textContent = budget.percentage + "%";
            } else {
                document.querySelector(DOMstrings.expensePercentage).textContent = "---"
            }
        },
        deleteItemUI: function (selectorID) {
            var el = document.querySelector("#" + selectorID);
            el.parentNode.removeChild(el);
        },
        updatePercentageUI: function (percentage) {
            var fields = document.querySelectorAll(DOMstrings.expenseItemPercentage);
            nodeListForEach(fields, function (current, index) {
                if (percentage[index] >= 0) {
                    current.textContent = percentage[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },
        getMonth: function () {
            var date, months, month, year;
            date = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = date.getMonth();
            year = date.getFullYear();
            document.querySelector(DOMstrings.month).textContent = months[month] + ", " + year;
        },
        changedType: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputType+","+DOMstrings.inputValue+","+DOMstrings.inputDescription);
            nodeListForEach(fields,function(current){
                current.classList.toggle("red-focus"); 
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var eventListener = function () {
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    }

    var updateBudget = function () {
        // 5. Calculate the budget 
        budgetCtrl.calculateTotal();
        // 6. Display the budget in the UI
        var budget = budgetCtrl.getBudget();
        UICtrl.updateBudgetUI(budget);
    }

    var updatePercentage = function () {
        budgetCtrl.setPercentages();
        var percentage = budgetCtrl.getPercentages();
        UICtrl.updatePercentageUI(percentage);
    }


    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input Data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UIController
            UICtrl.updateInput(newItem, input.type);
            // 4.Clear the fields
            UICtrl.clearField();
            // 5.Update the budget
            updateBudget();
            // 6.Update the expense percentages
            updatePercentage();
        } else {
            alert("Enter Description or Value");
        }

    }

    var ctrlDeleteItem = function () {
        var selectorID, eventID, type, ID;
        selectorID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        eventID = selectorID.split("-");
        type = eventID[0];
        ID = parseInt(eventID[1]);

        //1. Delete Item from data
        budgetCtrl.deleteItem(type, ID);
        //2. Delete Item from UI
        UICtrl.deleteItemUI(selectorID);
        //3. Update budget
        updateBudget();
        // 4.Update the expense percentages
        updatePercentage();
    }


    return {
        init: function () {
            console.log("App has been started.")
            eventListener();
            UICtrl.getMonth();
        }
    }

})(budgetController, UIController);


controller.init();