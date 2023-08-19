import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, getDocs, query, where, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBhLtgpat25hey5rG_YLsGSuUAEjU4F3ak",
    authDomain: "test-d3f35.firebaseapp.com",
    projectId: "test-d3f35",
    storageBucket: "test-d3f35.appspot.com",
    messagingSenderId: "586158895484",
    appId: "1:586158895484:web:2ae65d51bf39105da2b4f9",
    measurementId: "G-XZXSZBPEYN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

let uid, currentUserInfo, userImgUrl;
const loader = document.getElementById("loader")
const signUpForm = document.getElementById("signUp-form")
const logInForm = document.getElementById("logIn-form")
const signUp = document.getElementById("signUp")
const logIn = document.getElementById("logIn")
const firstName = document.getElementById("signUp-fn")
const lastName = document.getElementById("signUp-ln")
const signUpEmail = document.getElementById("signUp-email")
const signUpPass = document.getElementById("signUp-pass")
const signUpConfirmPass = document.getElementById("signUp-comfirmPass")
const signUpImg = document.getElementById("signUp-img")
const signUpBtn = document.getElementById("signUp-btn")
const logInEmail = document.getElementById("logIn-email")
const logInPass = document.getElementById("logIn-pass")
const logInBtn = document.getElementById("logIn-btn")
const dashboard = document.getElementById("dashboard")
const main = document.getElementById("main")
const navLogIn = document.getElementById("nav-logIn")
const navLogOut = document.getElementById("nav-logOut")
const createAccounBtn = document.getElementById("create-account-btn")
const userName = document.getElementById("userName")
const blogTitle = document.getElementById("blog-title")
const blogDesc = document.getElementById("blog-desc")
const publishBtn = document.getElementById("publish-btn")
const myBlogs = document.getElementById("my-blogs")
const allPost = document.getElementById("all-post")

onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid
        loader.classList.add('d-none')
        dashboard.classList.add('d-block')
        dashboard.classList.remove('d-none')
        navLogIn.classList.add('d-none')
        navLogIn.classList.remove('d-block')
        navLogOut.classList.add('d-block')
        navLogOut.classList.remove('d-none')
        logIn.classList.add('d-none')
        logIn.classList.remove('d-block')
        signUp.classList.add('d-none')
        signUp.classList.remove('d-block')
        setTimeout(() => {
            getUserInfo()
            getBlogs()
        }, 2000);
    } else {
        loader.classList.add('d-none')
        main.classList.add('d-block')
        main.classList.remove('d-none')
        getAllPost()
    }
});

async function getUserInfo() {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        currentUserInfo = docSnap.data()
        userName.innerText = currentUserInfo.firstName
    } else {
        console.log("No such document!");
    }
}

function signIn(e) {
    e.preventDefault()
    signInWithEmailAndPassword(auth, logInEmail.value, logInPass.value)
        .then((userCredential) => {
            const user = userCredential.user;
            uid = user.uid;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode)
        });
};
logInBtn.addEventListener('click', signIn)

function uploadImg() {
    const imgRef = ref(storage, `users/${signUpImg.files[0].name}`);
    uploadBytes(imgRef, signUpImg.files[0]).then((snapshot) => {
        getDownloadURL(imgRef)
            .then(url => {
                userImgUrl = url;
            })
            .catch(err => console.error(err))
    });
};
signUpImg.addEventListener('change', uploadImg)

async function register(e) {
    e.preventDefault();

    if (signUpPass.value === signUpConfirmPass.value) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail.value, signUpPass.value);
            const user = userCredential.user;
            uid = user.uid;

            setTimeout(async () => {
                const userObj = {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: signUpEmail.value,
                    password: signUpPass.value,
                    userImg: await userImgUrl,
                };

                await setDoc(doc(db, "users", uid), userObj);

            }, 2000);
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode);
            alert(errorMessage);
            console.error(error);
        }
    } else {
        alert("Password and confirm should be the same");
    }
};
signUpBtn.addEventListener('click', register)

function logOut() {
    signOut(auth).then(() => {
        location.reload()
    }).catch((error) => {
    });
}
navLogOut.addEventListener('click', logOut)

function showLogin() {
    main.classList.add('d-none')
    main.classList.remove('d-block')
    logIn.classList.add('d-block')
    logIn.classList.remove('d-none')
    signUp.classList.add('d-none')
    signUp.classList.remove('d-block')
}
navLogIn.addEventListener('click', showLogin)

function showSignUp() {
    signUp.classList.add('d-block')
    signUp.classList.remove('d-none')
    logIn.classList.add('d-none')
    logIn.classList.remove('d-block')
}
createAccounBtn.addEventListener('click', showSignUp)

async function submitBlog() {
    if (blogTitle.value.length >= 5 && blogTitle.value.length <= 50 && blogDesc.value.length >= 100 && blogDesc.value.length <= 3000) {
        const d = new Date().toLocaleDateString()
        const blogRef = await addDoc(collection(db, "blogs"), {
            author: currentUserInfo.firstName,
            title: blogTitle.value,
            desc: blogDesc.value,
            uid,
            date: d,
            imgUrl: currentUserInfo.userImg
        });
        blogTitle.value = ''
        blogDesc.value = ''   
    } else {
        alert("Title should be b/w 5 - 50 characters \n Decscription should be b/w 100 - 3000 characters")
    }
}

publishBtn.addEventListener('click', submitBlog)

function getBlogs() {
    const q = query(collection(db, "blogs"), where("uid", "==", uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        myBlogs.innerHTML = ''
        querySnapshot.forEach((doc) => {
            const { author, date, desc, imgUrl, title } = doc.data();
            let card = `<div class="cards">
        <div class="d-flex align-items-center">
            <img src="${imgUrl}" alt="" height="50px" width="50px">
            <div class="ms-2">
                <h3 class="m-0 p-0">${title}</h3>
                <span>${author}</span>
                <span>-</span>
                <span>${date}</span>
            </div>
        </div>
        <div>
            <span>${desc}</span>
        </div>
        <div>
        
            <span class="del-btn" data-id=${doc.id}>delete</span>
            <span class="del-btn">edit</span>
        </div>
        </div>`

            myBlogs.innerHTML += card;
        });

        // let editButtons = document.getElementsByClassName('edit-btn')
        // Array.from(editButtons).forEach((btn) => {
        //     btn.addEventListener('click', (e) => {
        //         let blogId = e.target.getAttribute("data-id");
        //         if (blogId) {
        //             const editTitle =   e.target.parentNode.parentNode.children[0].children[1].children[0].innerHTML
        //             const editDesc = e.target.parentNode.parentNode.children[1].children[0].innerHTML
        //             console.log(editTitle);
        //             console.log(editDesc);
        //             e.target.parentNode.children[1].children[0].children[0].children[1].children[0].value = editTitle;
        //             e.target.parentNode.children[1].children[0].children[0].children[1].children[1].value = editDesc;
        //         }
        //     })
        // })

        // let saveButtons = document.getElementsByClassName('save-btn')
        // Array.from(saveButtons).forEach((btn) => {
        //     btn.addEventListener('click', async (e) => {
        //         let id = e.target.getAttribute("data-id");
        //         let updateId = id.slice(0, id.length - 5);
        //         let saveTitle = e.target.parentNode.parentNode.children[1].children[0].value
        //         let saveDesc = e.target.parentNode.parentNode.children[1].children[1].value

        //         const querySnapshot = await doc(db, "blogs", updateId);

        //         querySnapshot.forEach((doc) => {
        //             updateDoc(doc.ref, { title : saveTitle, desc : saveDesc })
        //                 .then(() => {
        //                     console.log("Document successfully updated!");
        //                 })
        //                 .catch((error) => {
        //                     console.error("Error updating document:", error);
        //                 });
        //         });
        //     })
        // })

        let deleteButtons = document.getElementsByClassName('del-btn')
        Array.from(deleteButtons).forEach((btn) => {
            btn.addEventListener('click', (e) => {
                let blogId = e.target.getAttribute("data-id");
                if (blogId) {
                    deleteBlog(blogId);
                }
            })
        })
    });
}


function deleteBlog(blogId) {
    deleteDoc(doc(db, "blogs", blogId))
        .then(() => {
        })
        .catch((error) => {
            console.error("Error deleting blog:");
        });
}

function getAllPost() {

    const q = query(collection(db, "blogs"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        allPost.innerHTML = '';
        querySnapshot.forEach((doc) => {
            let data = doc.data()

            let card = `<div class='my-5 cards all-post-cards'>
        <div class="d-flex align-items-center">
            <img src="${data.imgUrl}" alt="" height="50px" width="50px">
            <div class="ms-2">
                <h3 class="m-0 p-0 text-capitalize">${data.title}</h3>
                <span>${data.author}</span>
                <span>-</span>
                <span>${data.date}</span>
            </div>
        </div>
        <div>
            <span class="fs-6 text-capitalize">${data.desc}</span>
        </div>
        </div>`

        allPost.innerHTML += card;
        });
    });
}