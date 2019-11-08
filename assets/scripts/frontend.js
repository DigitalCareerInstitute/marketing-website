// import $ from "jquery";
// import Popper from "popper.js";
import "bootstrap/js/dist/util";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/scrollspy";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/alert";

require("../css/style.scss");

const toggleNL = (remove = false) => {
  document.getElementById("nlbtn").disabled = remove ? "" : "disabled";
  document.getElementById("nlbtn").innerHTML = remove ? "Subscribe" : "Loading";
  document
    .getElementById("mc-embedded-subscribe-form")
    .classList.toggle("half-transparent");
};

(function() {
  var newsletterForm = document.querySelector("#mc-embedded-subscribe-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var email = document.querySelector("#newsletter_email").value.trim();
      if (email) {
        toggleNL();
        fetch("/newsletter-signup", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ email }) // data can be `string` or {object}!
        })
          .then(res => res.json())
          .then(response => {
            const nlHeadline = document.getElementById("nlheadline");

            if (response.code === 200) {
              nlHeadline.innerHTML = response.message;
            } else if (response.code === 422) {
              toggleNL(true);
              nlHeadline.innerHTML =
                "User alread in list, check your mails for a existing verification mail";
            }
          })
          .catch(error => {
            console.error("Error:", error);
          });
      }
    });
  }
})();

let counted = false;
const countUp = () => {
  const counter = document.querySelector(".section-counter");

  if (counter && elementInViewport2(counter) && !counted) {
    counted = true;
    $(".counter-count").each(function() {
      $(this)
        .prop("Counter", 0)
        .animate(
          {
            Counter: $(this).text()
          },
          {
            duration: 5000,
            easing: "swing",
            step: function(now) {
              $(this).text(Math.ceil(now));
            }
          }
        );
    });
  }
};
var scrollbuttons = document.getElementsByClassName("scrollbutton");
for (var i = 0, len = scrollbuttons.length; i < len; i++) {
  scrollbuttons[i].addEventListener("click", function(event) {
    event.preventDefault();
    document.querySelector(event.target.attributes.href.value).scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  });
}
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

var floatings = [...document.querySelectorAll(".floatings")];
function showFloatings() {
  let timeout = 0;
  floatings.forEach(item => {
    if (elementInViewport2(item) && window.innerWidth > 576) {
      setTimeout(() => {
        item.classList.add("floated");
      }, timeout);
      timeout += 150;
    }
  });
}
function elementInViewport2(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < window.pageYOffset + window.innerHeight - window.innerHeight / 5 &&
    left < window.pageXOffset + window.innerWidth &&
    top + height > window.pageYOffset &&
    left + width > window.pageXOffset
  );
}
window.onscroll = throttle(function() {
  showFloatings();
  countUp();
}, 10);

$("#contactFormModal").on("shown.bs.modal", function(e) {
  window.document.querySelector("#track").value = window.location.href;
  window.history.replaceState(window.location.pathname, "/", `/contact`);
});

$("#contactFormModal").on("hidden.bs.modal", function(e) {
  window.document.querySelector("#track").value = "";
  window.history.replaceState({}, "/", window.history.state);
});

const getFileElements = document.querySelectorAll("[type='file']");
getFileElements.forEach(el => {
  el.addEventListener("change", () => {
    console.log("getFileElements MAP   ==>", el.files[0]);
    const Filetype = el.files[0].type;
    let alert = document.querySelector("#invalidFile");
    if (
      Filetype !== "application/pdf" &&
      Filetype !== "image/jpeg" &&
      Filetype !== "image/png" &&
      Filetype !== "image/jpg" &&
      Filetype !== "image/svg+xml"
    ) {
      el.value = "";
      alert ? alert.remove() : null;
      let newItem = document.createElement("div");
      newItem.innerHTML = `<div id="invalidFile" class="alert alert-danger"                       role="alert">
                             This field not accept ${Filetype}
                            </div>`;
      function insertAfter(el, referenceNode) {
        referenceNode.parentNode.insertBefore(el, referenceNode);
      }
      insertAfter(newItem, el);
    }
    alert ? alert.remove() : null;
  });
});

function objectToCsv(data) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = !!row[header] ? "" + row[header].replace(/"/g, '\\"') : "";
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

function downloadCsv(data) {
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("id", "csv");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", "CSVDownloadOfLeads.csv");
  document.body.appendChild(a);
  a.click();
  a.removeChild(a);
}

$("#downloadCSV").on("click", function(e) {
  fetch(window.location.href + "/api-json")
    .then(resp => resp.json())
    .then(data => {
      let leads = data.map(lead => ({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        locations: lead.locations && lead.locations[0] ? lead.locations[0].name : ""
      }));
      let csvRow = objectToCsv(leads);
      downloadCsv(csvRow);
    })
    .catch(error => console.log("error ===>", error));
});

//
// let typedCursor = new Typed('.subtitle', {
//   strings: ["Learn digital skills with us to get the most fulfilling jobs."],
//   typeSpeed: 30,
//   loop: true
// });
// console.log(typedCursor)

//nav-sticky
// const nav = document.querySelector('#headernav');
// const navTop = nav.offsetTop;
//
// function stickyNavigation() {
//   console.log('navTop = ' + navTop);
//   console.log('scrollY = ' + window.scrollY);
//
//   if (window.scrollY >= navTop) {
//     // nav offsetHeight = height of nav
//     document.body.style.paddingTop = nav.offsetHeight + 'px';
//     document.body.classList.add('fixed-nav');
//   } else {
//     document.body.style.paddingTop = 0;
//     document.body.classList.remove('fixed-nav');
//   }
// }
//
// window.addEventListener('scroll', stickyNavigation);
