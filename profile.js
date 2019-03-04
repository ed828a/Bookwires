'use strict';
const sampleBooks = []
for(let p=0; p<7; p++){
    sampleBooks.push(new Book('Harry Potter', fakeUser[2],'1999/10/1','img/harryPotter.jpg','fantasy'));
    sampleBooks.push(new Book('Time Raiders', fakeUser[0],'2002/4/5','img/TimeRaiders.jpg','fantasy'));
    sampleBooks.push(new Book('Wandering Earth', fakeUser[1],'2008/8/8','img/WanderingEarth.jpg','Sci-fi'));
    sampleBooks.push(new Book('ThreeBody Problem', fakeUser[1],'2010/5/3','img/threebody.jpg','Sci-fi'));
    
}
sampleBooks.push(new Book('ThreeBody Problem', fakeUser[1],'2010/5/3','img/threebody.jpg','Sci-fi'));
sampleUser.bookshelf = sampleBooks;


const emailaddress = document.querySelector("#emailaddress");
const username = document.querySelector("#username");
const pass = document.querySelector("#password");

const profileHeader = document.querySelector(".profileheader");
const followers = document.querySelector("#followerCount");
const following = document.querySelector("#followingCount");
const writtenCount = document.querySelector("#writenCount");
const description = document.querySelector(".profiletextcontainer > p");
const descriptionEditable = document.querySelector("#description");

const mainContent = document.querySelector("#main-content-containter");
const navSettings = document.querySelector(".nav").children;

const shelfButton = document.querySelector("#navShelf");

shelfButton.addEventListener('click', setUpShelf);

const settingsButton = document.querySelector("#navSettings");

settingsButton.addEventListener('click', setUpSettings);

// settings buttons
const editButton = document.querySelector("#editbutton");
editButton.addEventListener('click', changeEditable);

const confirmButton = document.querySelector("#confirmbutton");
confirmButton.addEventListener('click', confirmChanges);

const cancelButton = document.querySelector("#cancelbutton");
cancelButton.addEventListener('click', cancelChanges);

const carouselInner = document.querySelector(".carousel-inner");

//nav vars
let curNav = shelfButton;
let curDiv = document.querySelector("#book-shelf");

// serach button
const searchButton = document.querySelector("#search-button");
searchButton.addEventListener('click', updateShelf);
const searchBox = document.querySelector(".shelf-search");

//AuthoredButton
const authoredButton = document.querySelector("#navAuthored");
authoredButton.addEventListener('click', setUpAuthorShelf);

//Following Button
const followingButton = document.querySelector("#navFollowing");
followingButton.addEventListener('click', setUpFollowingList);


function setUpCarousel(bookList){
    while (carouselInner.firstChild) {
        carouselInner.removeChild(carouselInner.firstChild);
    }

    const indList = document.createElement("ol");
    indList.className = "carousel-indicators";
    carouselInner.appendChild(indList);


    for(let i=0; i < Math.ceil(bookList.length / 15); i++){
        const newCarousel = document.createElement("DIV");
        const newCarIndicator = document.createElement("li");
        newCarIndicator.setAttribute("data-target", "#book-shelf");
        newCarIndicator.setAttribute("data-slide-to", i.toString());
        
        if(i==0){
            newCarousel.className = "carousel-item active";
            newCarIndicator.className = "active";
        }else{
            newCarousel.className = "carousel-item";
        }
        // need in for loop
        const newCarouselRowCont = document.createElement("DIV");
        newCarouselRowCont.className = "rows-container";
        newCarousel.appendChild(newCarouselRowCont);

        const booksleftPage = Math.min(15, bookList.length - i*15);

        for(let j=0; j < Math.ceil(bookList.length / 5); j++){
            const newCarouselUl = document.createElement("ul");
            newCarouselUl.className = "book-row";
            newCarouselRowCont.appendChild(newCarouselUl);

            for(let b=0; b<Math.min(5, booksleftPage - j*5); b++){
                const newLi = document.createElement("li");
                const newImg = document.createElement("img");
                const bookToAdd = bookList[(i*15 + j*5 + b)]
                newImg.src = bookToAdd.image;
                newImg.title = bookToAdd.bookTitle;
                newLi.onclick = function () {
                    location.href = "book.html";
                };
                // newImg.addEventListener('click', goToBookPage);

                newLi.appendChild(newImg);
                newCarouselUl.appendChild(newLi);
                // ADD HOVER OPTIONS
            }
        }

        carouselInner.appendChild(newCarousel);
        indList.appendChild(newCarIndicator);
        
    }
}

function setUpUserPage(){

    // will make image editable when we create backend
    profileHeader.innerHTML = sampleUser.name;
    username.placeholder = sampleUser.name;
    followers.innerHTML = sampleUser.followers;
    following.innerHTML = sampleUser.following.length;
    writtenCount.innerHTML = sampleUser.writtenBook.length;

    description.innerHTML = sampleUser.description;

    emailaddress.placeholder = sampleUser.mailAddress;
    descriptionEditable.placeholder = sampleUser.description;
    setUpCarousel(sampleUser.bookshelf);

}
setUpUserPage();



function setUpShelf(e){
    e.preventDefault();
    changeActive(shelfButton, document.querySelector("#book-shelf"));

    // clear search bars
    searchBox.value = '';

    setUpCarousel(sampleUser.bookshelf);
    
    
}

function setUpSettings(e){
    e.preventDefault();
    changeActive(settingsButton, document.querySelector("#settings"));
}

function setUpFollowingList(e){
    e.preventDefault();
    changeActive(followingButton, document.querySelector("#following"));
    for(let i=0;i<sampleUser.following.length;i++){
        const newFollowCont = document.createElement("li");
        newFollowCont.className = "following-container";

        const followingImg = document.createElement("img");
        followingImg.src = sampleUser.following[i].image;

        const followingInfo = document.createElement("div");
        followingImg.className = "following-info";

        const followingName = document.createElement("h3");
        followingName = innerHTML = sampleUser.following[i].name;

        const followingWritten = document.createElement("h4");
        followingWritten.innerHTML = "Books Written: "

        const followingWrittenCount = document.createElement("span");
        followingWrittenCount.innerHTML = sampleUser.following[i].writtenBook.length;

        const unFollowButton = document.createElement("span");
        unFollowButton.innerHTML = "Unfollow";
    }
}

function updateShelf(e){
    e.preventDefault();

    if(searchBox.value === ''){
        return
    }
    setUpCarousel(fuzzyBookSearch(searchBox.value, sampleUser.bookshelf));
    document.querySelector("#book-shelf").querySelector("h1").innerHTML = "My Bookshelf"

}



function changeActive(elem, newDiv){
    curNav.classList.remove("active");
    elem.classList.add("active");
    curNav = elem;

    curDiv.classList.remove("active");
    curDiv.classList.add("fade")
    newDiv.classList.remove("fade");
    newDiv.classList.add("active");
    curDiv = newDiv;
}

function setUpAuthorShelf(e){
    e.preventDefault();
    changeActive(authoredButton, document.querySelector("#book-shelf"));

    searchBox.value = '';
    setUpCarousel(sampleUser.writtenBook);
    document.querySelector("#book-shelf").querySelector("h1").innerHTML = "Authored Books"
}


function changeEditable(e){
    e.preventDefault();
    cancelButton.style.display = "inline";

    confirmButton.disabled = false;
    confirmButton.className = "btn btn-success";

    emailaddress.value = sampleUser.mailAddress;
    emailaddress.readOnly = false;

    username.value = sampleUser.name;
    username.readOnly = false;

    pass.value = sampleUser.password;
    pass.readOnly = false;

    descriptionEditable.value = sampleUser.description;
    descriptionEditable.readOnly = false;
}

function confirmChanges(e){
    e.preventDefault();
    // update User values
    sampleUser.mailAddress = emailaddress.value;
    sampleUser.name = username.value;
    sampleUser.password = pass.value;
    sampleUser.description = descriptionEditable.value;

    // reset buttons
    confirmButton.disabled= true;
    confirmButton.className = "btn btn-secondary";
    cancelButton.style.display = "none";

    //update profile html elements
    profileHeader.innerHTML = sampleUser.name;
    username.innerHTML = sampleUser.name;
    description.innerHTML = sampleUser.description;

    // update editable fields
    username.readOnly = true;
    username.placeholder = sampleUser.name;
    emailaddress.readOnly = true;
    emailaddress.placeholder = sampleUser.mailAddress;
    descriptionEditable.readOnly = true;
    descriptionEditable.placeholder = sampleUser.description;
    ppass.readOnly = true;
}

function cancelChanges(e){
    e.preventDefault();

    username.readOnly = true;
    username.placeholder = sampleUser.name;
    emailaddress.readOnly = true;
    emailaddress.placeholder = sampleUser.mailAddress;
    descriptionEditable.readOnly = true;
    descriptionEditable.placeholder = sampleUser.description;
    pass.readOnly = true;

    confirmButton.disabled= true;
    confirmButton.className = "btn btn-secondary";
    cancelButton.style.display = "none";


}