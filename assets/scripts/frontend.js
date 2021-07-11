import "bootstrap/js/dist/util";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/scrollspy";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/carousel";
import "bootstrap/js/dist/alert";
import { alertTimeout } from "./helper.js"
import "./flow-builder"

require("../css/style.scss");

const get_form_payload = (elements) => {
  const notUnselectedInputs = [...elements].filter(e => e.type === 'radio' && e.checked || e.type != 'radio')
    .filter(i => i.type !== "submit")
  return notUnselectedInputs
    .reduce((acc, el) => {
      const inputValue = el.type === "checkbox" ? el.checked : el.name === "jobcenter" ? !!Number(el.value) : el.value
      return {
        ...acc,
        [el.name]: inputValue
      }
    }, {})
}
const toggleNL = (remove = false) => {
  document.getElementById("nlbtn").disabled = remove ? "" : "disabled";
  document.getElementById("nlbtn").innerHTML = remove ? "Subscribe" : "Loading";
  document
    .getElementById("mc-embedded-subscribe-form")
    .classList.toggle("half-transparent");
};

(function () {
  const newsletterForm = document.querySelector("#mc-embedded-subscribe-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.querySelector("#newsletter_email").value.trim();
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
                "User already in list, check your mails for a existing verification mail";
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
const animationDuration = 4000;
const frameDuration = 1000 / 60;
const totalFrames = Math.round(animationDuration / frameDuration);
const easeOutQuad = t => t * (2 - t);
const animateCountUp = el => {
  let frame = 0;
  const countTo = parseInt(el.innerHTML, 10);
  const counter = setInterval(() => {
    frame++;
    const progress = easeOutQuad(frame / totalFrames);
    const currentCount = Math.round(countTo * progress);
    if (parseInt(el.innerHTML, 10) !== currentCount) {
      el.innerHTML = currentCount;
    }
    if (frame === totalFrames) {
      clearInterval(counter);
    }
  }, frameDuration);
};

const countUp = () => {
  const counter = document.querySelector(".section-counter");
  if (counter && elementInViewport(counter) && !counted) {
    counted = true
    const countupEls = document.querySelectorAll('.counter-count');
    countupEls.forEach(animateCountUp);
  }
};

const scrollbuttons = document.getElementsByClassName("scrollbutton");
for (let i = 0, len = scrollbuttons.length; i < len; i++) {
  scrollbuttons[i].addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(event.target.attributes.href.value.replace(/.*(#.*)/, '$1')).scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    window.history.pushState({}, {}, event.target.attributes.href.value)
  });
}
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

const floatings = [...document.querySelectorAll(".floatings")];

function showFloatings() {
  let timeout = 0;
  floatings.forEach(item => {
    if (elementInViewport(item) && window.innerWidth > 576) {
      setTimeout(() => {
        item.classList.add("floated");
      }, timeout);
      timeout += 150;
    }
  });
}

function elementInViewport(el) {
  let top = el.offsetTop;
  let left = el.offsetLeft;
  let width = el.offsetWidth;
  let height = el.offsetHeight;

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

window.onscroll = () => {
  throttle(
    showFloatings(),
    countUp()
    , 50)
  throttle(
    animatedPolygons()
    , 200)
};

const classes = ['shift-up', 'shift-left', 'shift-bottom', 'shift-right']
const elements = document.querySelectorAll('.intersection_observed')
const animatedPolygons = () => {
  Array.from(elements).map((element, index) => {
    if (element.getBoundingClientRect().y > window.outerHeight / 2 || window.scrollY < 100) {
      classes.map(cl => element.classList.remove(cl))
    } else {
      element.classList.add(element.dataset.class)
    }
  })
}

$("#contactFormModal").on("shown.bs.modal", function (e) {
  window.document.querySelector("#track").value = window.location.href;
  window.history.replaceState(window.location.pathname, "/", `/contact`);
});

$("#contactFormModal").on("hidden.bs.modal", function (e) {
  window.document.querySelector("#track").value = "";
  window.history.replaceState({}, "/", window.history.state);
});

// $('[data-spy="scroll"]').on('activate.bs.scrollspy', function () {
//   console.debug("yo")
// })
const getFileElements = document.querySelectorAll("[type='file']");
getFileElements.forEach(el => {
  el.addEventListener("change", () => {
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
      newItem.innerHTML = `<div id="invalidFile" class="alert alert-danger" role="alert">
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
  csvRows.push(headers.join(";"));
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = !!row[header]
        ? "" + row[header].toString().replace(/"/g, '\\"')
        : "";
      return `"${escaped}"`;
    });
    csvRows.push(values.join(";"));
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

$("#downloadCSV").on("click", function (e) {
  fetch("/admin/contacts/api-json")
    .then(resp => resp.json())
    .then(data => {
      let leads = data
        .map(lead => ({
          ...lead,
          utm_params: lead.utm_params ? JSON.stringify(lead.utm_params) : "",
          locations: lead.locations && lead.locations[0] ? lead.locations[0].name : ""
        }));
      console.log('leads', leads);
      let csvRow = objectToCsv(leads);
      downloadCsv(csvRow);
    })
    .catch(error => console.log("error ===>", error));
});
$("#curriculumpopup").on('show.bs.modal', function (e) {
  e.target.querySelector('form').dataset.course = e.relatedTarget.dataset.course
});
Array.from(document.querySelectorAll(".ajaxform")).map(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    e.target.querySelector('button').disabled = true;
    e.target.querySelector('#contactform_text').classList.add("d-none")
    e.target.querySelector('#contactform_spinner').classList.remove("d-none")
    get_form_payload(e.target.elements)
    payload = { ...payload, course: e.target.dataset.course }

    if (localStorage.getItem('dcianswers')) {
      payload.answers = JSON.parse(localStorage.getItem('dcianswers'))
    }
    fetch(e.target.action, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(data => data.json()).then(data => {
        e.target.querySelector('#contactform_spinner').classList.add("d-none")
        e.target.querySelector('#contactform_check').classList.remove("d-none")
        Array.from(e.target.elements).map(i => (i.value = "", i.style.boxShadow = "none"))
        const flashMessage = document.createElement('div')
        flashMessage.classList.add("flash", "m-0", "mr-3", "alert", "fade", "show", "alert-success")

        flashMessage.innerHTML = `${data.response.message}<button class="close ml-3" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>`
        document.body.appendChild(flashMessage)
        setTimeout(() => {
          $(".alert").alert("close");
        }, alertTimeout || 5000);
        if (data.response.contact_id && e.target.dataset.redirect === "true") {
          window.location.replace(`${window.location.origin}/thank-you/${data.response.contact_id}`);
        }
        if (data.response.filepath) {
          window.open(`${window.location.origin}/images/${data.response.filepath}`, '_blank')
        }
      })
      .catch(error => {
        e.target.querySelector('button').disabled = false;
        console.error(error)
      });
  })
})

window.onload = function () {
  showFloatings();
  const errorContainer = document.querySelector(".cont_principal")
  if (errorContainer) {
    errorContainer.className = "cont_principal cont_error_active";
  }
};
//
// let typedCursor = new Typed('.subtitle', {
//   strings: ["Learn digital skills with us to get the most fulfilling jobs."],
//   typeSpeed: 30,
//   loop: true
// });
// console.log(typedCursor)


function stickyNavigation(element) {
  const nav = document.querySelector('nav.navbar');
  if (window.scrollY >= element.offsetHeight / 2) {
    nav.classList.add('bg-white');
  } else {
    nav.classList.remove('bg-white');
  }
}

const notFoundTimer = document.querySelector('.timerRedirect')
if (notFoundTimer) {
  let counter = 5
  setInterval(function () {
    if (counter > -1) {
      counter -= 1
      notFoundTimer.innerHTML = counter + ' '
      if (counter === 0) {
        window.location.replace('/')
      }
    }
  }, 1000);
}

const jobcenterSelect = document.querySelector('.jobcenter-location-select')
if (jobcenterSelect) {
  jobcenterSelect.addEventListener('change', (e) => {
    document.getElementById('jobcenter_address').innerText = e.target.selectedOptions[0].dataset.address
    document.getElementById('jobcenter_location').innerText = e.target.selectedOptions[0].dataset.location
    document.getElementById('jobcenter_email').innerText = e.target.selectedOptions[0].dataset.email || ''
    document.getElementById('jobcenter_phone').innerText = e.target.selectedOptions[0].dataset.phone || ''
    Array.from(document.querySelectorAll('.jobcenter-location-employee')).map(j => {
      if (j.dataset.location == e.target.selectedOptions[0].innerText) {
        j.classList.remove('hidden')
      } else {
        j.classList.add('hidden')
      }
    })
  })
}
function normalizeSlideHeights() {
  if (document.querySelector('.carousel')) {
    Array.from(document.querySelectorAll('.carousel')).map(carousel => {
      document.querySelector('.carousel-inner').removeAttribute('style')
      var items = carousel.querySelectorAll('.carousel-item')
      var maxHeight = Math.max.apply(null,
        Array.from(items).map(function (i) {
          i.style.display = "block"
          const height = i.offsetHeight
          i.removeAttribute('style')
          return height
        }));
      document.querySelector('.carousel-inner').style.height = maxHeight + 130 + 'px'
      if (carousel.querySelector('.rounded-md.border')) {
        Array.from(items).map((b) => {
          b.style.minHeight = 0
          b.querySelector('.rounded-md.border').style.minHeight = 0
        })
        Array.from(items).map((b) => {
          b.style.minHeight = maxHeight + 'px'
          b.querySelector('.rounded-md.border').style.minHeight = maxHeight + 'px'
        })
      }
    })
  }
}

$(window).on(
  'load resize orientationchange',
  throttle(normalizeSlideHeights, 300));

Array.from(document.querySelectorAll('.dropdown-custom')).map(dropdown => {
  dropdown.addEventListener('click', function (e) {
    dropdown.classList.toggle("show")
    dropdown.querySelector('.dropdown-menu').classList.toggle('show')
  })
})

// const setObserver = (ref) => {
//   let options = {
//     threshold: 0.9
//   }
//   let observer = new IntersectionObserver(handler, options);
//   observer.observe(ref);
// }
// function handler(entries, observer) {
//   entries.map(entry => {
//     console.log('entry', Date.now());
//     if (entry.isIntersecting) {
//       console.log("Hey", entry);
//       entry.target.style.transform = `translateY(${window.scrollY}px)`
//     } else {
//       console.log("Ho");
//     }
//   })
// }
// setObserver(document.querySelector('.intersection_observed'))
