"use strict";

//NOTE:All Selections
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const section1 = document.querySelector("#section--1");
const pageNavigation1 = document.querySelector(".nav__links");
const pageNavigation2 = document.querySelectorAll(".nav__link");
const tabs = document.querySelectorAll(".operations__tab");
const tabsContainer = document.querySelector(".operations__tab-container");
const tabsContent = document.querySelectorAll(".operations__content");
const nav = document.querySelector(".nav");
const allSections = document.querySelectorAll(".section");
const slides = document.querySelectorAll(".slide");
const sliderContainer = document.querySelector(".slider");
const dotContainer = document.querySelector(".dots");
const header = document.querySelector(".header");
const imgTargets = document.querySelectorAll("img[data-src]");
//NOTE:All buttons
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");
const login = document.querySelector(".nav__link--login");
const btnScrollTo = document.querySelector(".btn--scroll-to");
const btnLeft = document.querySelector(".slider__btn--left");
const btnRight = document.querySelector(".slider__btn--right");

//NOTE:这个是之前第6章的内容，打开关闭modal，在导航栏和页尾的地方有open account的绿色按钮，重新复习一下怎么打开这个
function showModalAndOverlay() {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function hiddenModalAndOverlay() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}

login.addEventListener("click", function () {
  window.location.href = "app.html";
});

btnsOpenModal.forEach((btnOpenModal) => {
  btnOpenModal.addEventListener("click", showModalAndOverlay);
});

btnCloseModal.addEventListener("click", hiddenModalAndOverlay);

overlay.addEventListener("click", hiddenModalAndOverlay);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) hiddenModalAndOverlay();
});
//NOTE:Learn More Button实现滚动到section1
btnScrollTo.addEventListener("click", function (e) {
  e.preventDefault();
  section1.scrollIntoView({behavior: "smooth"});
});
//NOTE:利用Event Delegation和event bubbling实现导航栏三个按钮的页面滚动
pageNavigation1.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.classList.contains("nav__link")) {
    const id = e.target.getAttribute("href");
    document.querySelector(id).scrollIntoView({behavior: "smooth"});
  }
});
//NOTE:实现section2中的三个tab的点击浮动特效和相关内容显示的特效，还是运用event bubbling来实现
tabsContainer.addEventListener("click", function (e) {
  e.preventDefault();
  const clicked = e.target.closest(".operations__tab");
  if (!clicked) return; //NOTE:防止点在空白区域
  tabs.forEach((t) => t.classList.remove("operations__tab--active"));
  document.querySelector(`.operations__tab--${clicked.dataset.tab}`).classList.add("operations__tab--active");
  tabsContent.forEach((tc) => tc.classList.remove("operations__content--active"));
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add("operations__content--active");
});

//NOTE:实现导航栏鼠标悬停时，其他按钮的灰度变化特效。思路是悬停的颜色不变，找悬停的siblings，然后让除了悬停的所有siblings都变。然后将函数绑定给0.5或者1，放入eventlistener
function changeOpacity(e) {
  if (e.target.classList.contains("nav__link")) {
    const targetLink = e.target;
    const logo = document.querySelector(".nav__logo");
    logo.style.opacity = this;
    pageNavigation2.forEach((link) => {
      if (link !== targetLink) {
        link.style.opacity = this;
      }
    });
  }
}
nav.addEventListener("mouseover", changeOpacity.bind(0.5));
nav.addEventListener("mouseout", changeOpacity.bind(1));
//NOTE:实现导航栏划过section1之后总是粘贴在viewport顶部的特效
function stickyNav(entries) {
  const [entry] = entries;
  console.log(entry);
  nav.classList.remove("sticky");
  if (!entry.isIntersecting) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
}
const options1 = {root: null, thresholds: 0.5, rootMargin: `-${nav.getBoundingClientRect().height}px`};
const headerObserver = new IntersectionObserver(stickyNav, options1);
headerObserver.observe(header);
//NOTE:利用InterSectionObserver实现4个seciton延时淡入viewport的效果
function reveal(entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
}
const options2 = {root: null, thresholds: 0.2};
const sectionsReveal = new IntersectionObserver(reveal, options2);
allSections.forEach((section) => {
  console.log(section);
  sectionsReveal.observe(section);
});
//NOTE:利用InterSectionObserver实现section2中每张图片延迟出现的特效
function imgLazyLoad(entries, observer) {
  const [entry] = entries;
  console.log(entry);
  if (entry.isIntersecting) {
    entry.target.src = entry.target.dataset.src;
    entry.target.addEventListener("load", function () {
      entry.target.classList.remove("lazy-img");
      observer.unobserve(entry.target);
    });
  }
}
const options3 = {root: null, thresholds: 0.5, rootMargin: "-100px"};
const imgLazyLoadObserver = new IntersectionObserver(imgLazyLoad, options3);
imgTargets.forEach((img) => {
  imgLazyLoadObserver.observe(img);
});
//NOTE:实现section3中slider点击按钮和按下键盘左右键滚动的特效，和slider下面的点点的特效
let currentSlide = 0;
const maxSlide = slides.length;

function goToSlide(slide) {
  slides.forEach((s, i) => {
    s.style.transform = `translateX(${100 * (i - slide)}%)`; //0 100 200
  });
}

function activiateDot() {
  slides.forEach((_, i) => {
    dotContainer.insertAdjacentHTML("beforeend", `<button class="dots__dot" data-slide="${i}"></button>`);
  });
}

function dotMovement(slide) {
  const alldots = document.querySelectorAll(".dots__dot");
  alldots.forEach((dot) => {
    dot.classList.remove("dots__dot--active");
    if (Number(dot.getAttribute("data-slide")) === slide) {
      dot.classList.add("dots__dot--active");
    } else {
      return;
    }
  });
}

activiateDot();
goToSlide(0);
dotMovement(0);

dotContainer.addEventListener("click", function (e) {
  goToSlide(e.target.dataset.slide);
  dotMovement(+e.target.dataset.slide);
});

btnRight.addEventListener("click", function () {
  currentSlide < slides.length - 1 ? currentSlide++ : (currentSlide = 0);
  goToSlide(currentSlide);
  dotMovement(currentSlide);
});

btnLeft.addEventListener("click", function () {
  currentSlide > 0 ? currentSlide-- : (currentSlide = slides.length - 1);
  goToSlide(currentSlide);
  dotMovement(currentSlide);
});
//END OF TOPIC
