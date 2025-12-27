// ==========================================
// 1. CONFIGURATION (SETTINGS)
// ==========================================
// ඔබේ WhatsApp අංකය (94 සමග)
const myPhoneNumber = "94743615411"; 

// ඔබේ Google Sheet Web App URL එක මෙතනට දමන්න
const scriptURL = 'https://script.google.com/macros/s/AKfycbwN9NF5ugfB7uGVBts5zSEfYSdi2rQJGOqt3gHorAD092guqX5h4yh6ncK8s6De0JHs/exec'; 


// ==========================================
// 2. MOBILE MENU LOGIC
// ==========================================
const navSlide = () => {
    const burger = document.getElementById('menuIcon');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if(burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }
}
navSlide();


// ==========================================
// 3. BOOKING FORM LOGIC (WhatsApp) - NO VEHICLE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Form Data (Vehicle ඉවත් කළා)
            var name = document.getElementById('name').value;
            var phone = document.getElementById('phone').value;
            var pickup = document.getElementById('pickup').value;
            var drop = document.getElementById('drop').value;
            var date = document.getElementById('date').value;
            var time = document.getElementById('time').value;

            // WhatsApp Message (Vehicle පේළිය අයින් කළා)
            var message = "Hello! I would like to book a ride.%0A%0A" +
                          "*Name:* " + name + "%0A" +
                          "*Phone:* " + phone + "%0A" + 
                          "*Pickup:* " + pickup + "%0A" +
                          "*Drop-off:* " + drop + "%0A" +
                          "*Date:* " + date + "%0A" +
                          "*Time:* " + time + "%0A%0A" +
                          "Please confirm availability.";

            var whatsappURL = "https://wa.me/" + myPhoneNumber + "?text=" + message;
            
            // WhatsApp වෙත යොමු කිරීම
            window.location.href = whatsappURL; 
        });
    }
});


// ==========================================
// 4. REVIEWS LOGIC (Google Sheets ONLY)
// ==========================================
const reviewList = document.getElementById('reviewList');
const loader = document.getElementById('loader');

// A. Load Reviews from Database
function loadReviews() {
    if(!reviewList) return; 

    loader.style.display = 'block';
    
    // Check if scriptURL is set
    if(scriptURL === 'YOUR_GOOGLE_SCRIPT_URL_HERE' || scriptURL === '') {
        loader.style.display = 'none';
        return;
    }

    // Cache busting to get fresh data
    const cacheBuster = scriptURL + '?v=' + new Date().getTime();

    fetch(cacheBuster)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            reviewList.innerHTML = ''; 
            
            // Add reviews (Newest first)
            data.reverse().forEach(review => {
                addReviewToHTML(review.name, review.rating, review.comment);
            });
            
            if(data.length === 0) {
                reviewList.innerHTML = '<p style="text-align:center; width:100%; color:#555;">No reviews yet. Be the first!</p>';
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            loader.style.display = 'none';
        });
}

// Page Load
window.addEventListener('load', loadReviews);


// B. Star Rating Click Logic
const stars = document.querySelectorAll('#starContainer i');
const ratingInput = document.getElementById('ratingValue');

stars.forEach(star => {
    star.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        ratingInput.value = value;
        
        stars.forEach(s => s.classList.remove('active'));
        for(let i=0; i<value; i++) {
            stars[i].classList.add('active');
        }
    });
});


// C. Submit Review Logic (Updated: No WhatsApp)
const reviewForm = document.getElementById('reviewForm');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const statusMsg = document.getElementById('statusMsg');

if(reviewForm) {
    reviewForm.addEventListener('submit', e => {
        e.preventDefault();
        
        if(ratingInput.value == "0") {
            alert("Please select a star rating!");
            return;
        }

        submitReviewBtn.disabled = true;
        submitReviewBtn.innerText = "Posting...";
        
        // 1. Send data to Google Sheet
        fetch(scriptURL, { method: 'POST', body: new FormData(reviewForm)})
            .then(response => {
                statusMsg.innerText = "Review submitted successfully!";
                statusMsg.style.color = "#28a745"; 
                
                // 2. Show on screen immediately
                addReviewToHTML(
                    document.getElementById('reviewerName').value,
                    ratingInput.value,
                    document.getElementById('reviewComment').value
                );
                
                // WhatsApp කොටස මෙතනින් ඉවත් කළා

                // Reset Form
                reviewForm.reset();
                stars.forEach(s => s.classList.remove('active'));
                ratingInput.value = "0";
                submitReviewBtn.innerText = "Post Review";
                submitReviewBtn.disabled = false;
                
                setTimeout(() => { statusMsg.innerText = ""; }, 3000);
            })
            .catch(error => {
                statusMsg.innerText = "Error! Please try again.";
                statusMsg.style.color = "red";
                submitReviewBtn.disabled = false;
                submitReviewBtn.innerText = "Post Review";
            });
    });
}

// Helper: Create HTML for a review
function addReviewToHTML(name, rating, comment) {
    let starsHtml = "";
    for(let i=0; i<rating; i++) starsHtml += '<i class="fas fa-star"></i>';
    
    const newReview = `
        <div class="review-box">
            <div class="user-profile">
                <div class="user-avatar"><i class="fas fa-user"></i></div>
                <div class="user-info">
                    <h4>${name}</h4>
                </div>
            </div>
            <div class="star-rating">${starsHtml}</div>
            <p class="review-text">"${comment}"</p>
        </div>
    `;
    reviewList.insertAdjacentHTML('afterbegin', newReview);
                        }

