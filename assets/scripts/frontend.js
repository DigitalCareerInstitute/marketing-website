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
