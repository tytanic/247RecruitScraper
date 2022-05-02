var acc = ["boston-college", "clemson", "florida-state", "louisville", "north-carolina-state", "syracuse", "wake-forest", "duke", "georgia-tech", "miami", "pittsburgh", "north-carolina", "virginia", "virginia-tech"];
var sec = ["alabama", "arkansas", "auburn", "florida", "georgia", "kentucky", "lsu", "mississippi-state", "missouri", "ole-miss", "south-carolina", "tennessee", "texas-am", "vanderbilt"];
var b1g = ["illinois", "indiana", "iowa", "michigan-state", "michigan", "minnesota", "nebraska", "northwestern", "ohio-state", "penn-state", "purdue", "rutgers", "wisconsin"];
var big12 = ["baylor", "iowa-state", "kansas", "kansas-state", "oklahoma", "oklahoma-state", "tcu", "texas", "texas-tech", "west-virginia"];
var pac12 = ["arizona-state", "arizona", "california", "colorado", "oregon", "oregon-state", "stanford", "ucla", "usc", "utah", "washington", "washington-state"];
var nc = ["wake-forest", "duke", "north-carolina-state", "north-carolina", "east-carolina", "charlotte", "appalachian-state"];
var opponents2020 = ["uconn", "notre-dame"];
var unc = ["north-carolina"];

var ignoreTransfers = false;

async function acc2022() {

    var conference = acc;
    var years = ["2022"];

    loadHTML(conference, years);
}

async function versus() {
    var conference = unc;
    var years = ["2019", "2018", "2017", "2016", "2015"];

    loadHTML(conference, years);
}

const listOfRecruits = [];

async function loadHTML(conference, years) {

    const listOfColleges = [];

    for (var i in years) {
        for (var e in conference) {
            var schoolURL = "https://247sports.com/college/" + conference[e] + "/Season/" + years[i] + "-Football/Commits/";
            listOfColleges.push(schoolURL);
        }
    }

    var college = '';
    var year = '';
    for (var i in listOfColleges) {
        var url = listOfColleges[i].split('/');
        college = url[4];
        year = url[6];
        console.log(college, year);
        let response = await fetch(listOfColleges[i]);
        switch (response.status) { // status "OK"
            case 200:
                var template = await response.text();
                document.getElementById("myBody").innerHTML = template;
                scrapeCommits(college, year);
                break;
            // status "Not Found"
            case 404:
                console.log('Not Found');
                break;
        }
        
    }
    //window.location.reload();
    var myJSON = JSON.stringify(listOfRecruits);
    console.log(myJSON)
    createTable(myJSON);
};

class Recruit {
    constructor(name, city, st, position, metrics, rating, natrank, posrank, staterank, college, year) {
        this.name = name;
        this.city = city;
        this.st = st;
        this.position = position;
        this.metrics = metrics;
        this.rating = rating;
        this.nationalRank = natrank;
        this.positionRank = posrank;
        this.stateRank = staterank;
        this.college = college;
        this.year = year;
    }
}

function scrapeCommits(college, year) {
    var elements = document.getElementsByClassName("ri-page__list-item");
    for (var i = 1; i < elements.length; i++) {
        var nameAndSchool = elements[i].getElementsByClassName("recruit")[0];
        if (nameAndSchool) {
            var name = nameAndSchool.getElementsByClassName('ri-page__name-link')[0].innerText;
            var school = nameAndSchool.getElementsByClassName("meta")[0].innerText;
            var regExp = /\(([^)]+)\)/;
            var city = '';
            var st = '';
            if (school != '  ()  ') {
                if (regExp.exec(school) != null) {
                    var cityState = regExp.exec(school)[1].split(',');
                    city = cityState[0];
                    st = cityState[1];
                }

            }
            var position = elements[i].getElementsByClassName("position")[0].innerText.trim();
            var metrics = elements[i].getElementsByClassName("metrics")[0].innerText.trim();
            var rating = elements[i].getElementsByClassName("score")[0].innerText.trim();
            var natrank = elements[i].getElementsByClassName("natrank")[0].innerText.trim();
            var posrank = elements[i].getElementsByClassName("posrank")[0].innerText.trim();
            var staterank = elements[i].getElementsByClassName("sttrank")[0].innerText.trim();
            var recruit = new Recruit(name, city, st, position, metrics, rating, natrank, posrank, staterank, college, year);
            listOfRecruits.push(recruit);
        }
    }
    if (ignoreTransfers) {
        console.log("Skipping Transfers");
    } else {
        console.log("Not skipping transfers")
        var transfers = document.getElementsByClassName("portal-list_itm");
        for (var i = 1; i < transfers.length; i++) {
            var player = transfers[i].getElementsByClassName("player")[0];
            var position = transfers[i].getElementsByClassName("position")[0].innerText.trim();
            var metrics = player.getElementsByClassName("metrics")[0].innerText.trim();
            var ratings = player.getElementsByClassName("rating")[0].getElementsByClassName("score");
            var city = '';
            var st = '';
            var natrank = '';
            var posrank = '';
            var staterank = '';
            var rating = 'N/A';
            var rawRating = '';
            var transferRating = '';
            if (ratings.length > 1) {
                transferRating = ratings[0].innerText.trim();
                rawRating = ratings[1].innerText.trim();
                rating = transferRating.replace('(T)', '');
            } else {
                rawRating = ratings[0].innerText.trim();
                rating = 'N/A';
            }
            var name1 = player.innerText.replace(metrics, '');
            var name2 = name1.replace(transferRating, '');
            var name = name2.replace(rawRating, '').trim();
            var transfer = new Recruit(name, city, st, position, metrics, rating, natrank, posrank, staterank, college);
            listOfRecruits.push(transfer);
            console.log(transfer.name, transfer.rating);
        }

    }

}

function createTable(myJson) {
    $('#overallBody').append('<p>TEST</p>');
    $('#table').bootstrapTable({data: myJson})
}
