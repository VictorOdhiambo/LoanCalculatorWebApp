$(document).ready(function () {
    $('#table').DataTable();
    $("#form").on("submit", (e) => {
        e.preventDefault();
        var amount = $("#amount").val();
        var startDate = $("#date").val();
        var period = $("#period").val();
        var frequency = $("select#payment option").filter(":selected").val();
        var interest = $("select#interest option").filter(":selected").val();

        if (interest == "reducing_balance") {
            calculateInstallmentsByReducingBal(amount, period, frequency, startDate);
        } else {
            calculateInstallmentsByFlatRate(amount, period, frequency, startDate);
        }
    });

    $("#btnGenPdf").on("click", () => {
        createPDF();
    })
});

function calculateInstallmentsByFlatRate(amount, period, frequency, startDate) {
    $.ajax("https://localhost:7167/flat-rate", {
        data: JSON.stringify(
            { amount, period, frequency, startDate }
        ),
        contentType: 'application/json',
        type: 'POST',
        success: function (res) {
            populateTable(res);
        },
        error: function (e) {
            console.log(e)
        }
    })
}

function calculateInstallmentsByReducingBal(amount, period, frequency, startDate) {
    $.ajax("https://localhost:7167/reducing-balance", {
        data: JSON.stringify(
            { amount, period, frequency, startDate }
        ),
        contentType: 'application/json',
        type: 'POST',
        success: function (res) {
            populateTable(res);
        },
        error: function (e) {
            console.log(e)
        }
    })
}

function populateTable(data) {
    var tbody = document.getElementById("tbody");
    var info = document.getElementById("info");

    tbody.innerHTML = "";
    info.innerHTML = "";

    var amount = 0;
    var rate = 0;
    var fee = 0;

    jQuery(data).each(function (i, item) {
        // console.log(item.paymentDate, item.emi, item.interest)
        if (i == 0) {
            amount = item.totalRepaymentAmount;
            rate = item.annualRate;
            fee = item.processingFee;
        };
        var tr = document.createElement("tr");
        var month = document.createElement("td");
        var principal = document.createElement("td");
        var emi = document.createElement("td");
        var interest = document.createElement("td");
        var percentage = document.createElement("td");

        month.innerHTML = item.paymentDate;
        principal.innerHTML = item.remainingPrincipal;
        emi.innerHTML = item.emi;
        interest.innerHTML = item.interest;
        percentage.innerHTML = item.percentagePaid + "%";

        tr.appendChild(month);
        tr.appendChild(principal);
        tr.appendChild(emi);
        tr.appendChild(interest);
        tr.appendChild(percentage);

        tbody.appendChild(tr);
    });

    var interest = $("select#interest option").filter(":selected").text()
    var payment = $("select#payment option").filter(":selected").text()

    var h0 = document.createElement('h2');
    h0.innerText = 'Loan Repayment | Installment Report';

    var h1 = document.createElement('p');
    h1.innerText = 'Total Amount + Processing Fee: ' + amount;
    var h2 = document.createElement('p');
    h2.innerText = 'Loan Interest Type: ' + interest;
    var h3 = document.createElement('p');
    h3.innerText = 'Loan Payment Frequency: ' + payment;
    var h4 = document.createElement('p');
    h4.innerText = 'Processing Fee: ' + fee + '%';
    var h5 = document.createElement('p');
    h5.innerText = 'Loan Annual Rate: ' + rate + '%';



    info.appendChild(h0);
    info.appendChild(h1);
    info.appendChild(h2);
    info.appendChild(h3);
    info.appendChild(h4);
    info.appendChild(h5);
}

function createPDF() {
    var sTable = document.getElementById('content');//.innerHTML;

    var wrapper = sTable.getElementsByClassName("dataTables_length")[0];
    var filter = sTable.getElementsByClassName("dataTables_filter")[0];
    var info = sTable.getElementsByClassName("dataTables_info")[0];
    var paginate = sTable.getElementsByClassName("dataTables_paginate")[0];

    wrapper.style.visibility = "hidden";
    filter.style.visibility = "hidden";
    info.style.visibility = "hidden";
    paginate.style.visibility = "hidden";

    var style = "<style>";
    style = style + "table {width: 100%;font: 17px Calibri;}";
    style = style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
    style = style + "padding: 2px 3px;text-align: center;}";
    style = style + "</style>";

    // CREATE A WINDOW OBJECT.
    var win = window.open('', '', 'height=700,width=700');

    win.document.write('<html><head>');
    win.document.write('<title>Loan Installment Payment</title>');   // <title> FOR PDF HEADER.
    win.document.write(style);          // ADD STYLE INSIDE THE HEAD TAG.
    win.document.write('</head>');
    win.document.write('<body>');
    win.document.write(sTable.innerHTML);         // THE TABLE CONTENTS INSIDE THE BODY TAG.
    win.document.write('</body></html>');

    win.document.close(); 	// CLOSE THE CURRENT WINDOW.
    console.log(win.document);
    win.print();    // PRINT THE CONTENTS.

    wrapper.style.visibility = "visible";
    filter.style.visibility = "visible";
    info.style.visibility = "visible";
    paginate.style.visibility = "visible";
}