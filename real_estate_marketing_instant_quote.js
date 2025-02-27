//slider - row 1
var squareFootageSlider = document.getElementById("squareFootageSlider");
var squareFootageInput = document.getElementById("square-footage-input");

//checkboxes - row 2
var hdrPhotography = document.getElementById("HDR-Photography");
var dronePhotography = document.getElementById("Drone-Photography");
var promotionalVideo = document.getElementById("Promotional-Video");
var virtualTour = document.getElementById("Virtual-Tour");

//checkboxes - row 3
var daysUntilShoot = document.getElementById("Days-Until-Shoot");
var sameDayShoots = document.getElementById("Same-Day-Shoots");

//switch - row 3
var videoType = document.getElementById("Video-Type");
var virtualTourType = document.getElementById("Virtual-Tour-Type");

//adress input - row 4
var propertyAddress = document.getElementById("Property-Address");

//checkbox - row 4
var generateFloorPlan = document.getElementById("Generate-Floor-Plan");

//checkboxes - row 5
var firstTimeDiscount = document.getElementById("First-Time-Discount");
var subscriberDiscount = document.getElementById("Subscriber-Discount");

//results - row 5
var totalCost = document.getElementById("totalCost");
var errorText = document.getElementById("quote-error");

//disabling overlays
var disableDaysUntilShoot = document.getElementById("disable-days-until-shoot");
var disableSameDayShoots = document.getElementById("disable-same-day-shoots");
var disableVideoType = document.getElementById("disable-video-type");
var disableTourType = document.getElementById("disable-tour-type");
var disableFloorPlan = document.getElementById("disable-floor-plan");
var disableFirstTimeDiscount = document.getElementById("disable-first-time-discount");

console.log("instant quote start");

var quote = "";
var discount = 0; //TODO: Display discount
var fees = 0; //TODO: Display fees
var previousAddress = "";

//Interactivity
function updateFields() {

    errorText.hidden = true;

    squareFootageInput.value = squareFootageSlider.value; //update square footage value
    
    //simple disabled field toggles
    if (!promotionalVideo.checked) {
        disableVideoType.hidden = false;
    } else {
        disableVideoType.hidden = true;
    }
    if (!virtualTour.checked) {
        disableTourType.hidden = false;
        disableFloorPlan.hidden = false;
        generateFloorPlan.checked = false;
    } else {
        disableTourType.hidden = true;
    }
    if (!virtualTour.checked || virtualTourType.checked) {
        disableFloorPlan.hidden = false;
        generateFloorPlan.checked = false;
    } else {
        disableFloorPlan.hidden = true;
    }
    if (sameDayShoots.value > 1 || daysUntilShoot.value < 3) {
        disableFirstTimeDiscount.hidden = false;
        firstTimeDiscount.checked = false;
    } else {
        disableFirstTimeDiscount.hidden = true;
    }

    //set same day shoots
    var sqft = squareFootageInput.value;
    var maxSameDayShoots = 1;
    if (!dronePhotography.checked && !promotionalVideo.checked) { //bulk quotes not available for these services
        disableSameDayShoots.hidden = true;
        switch (true) {
            case (sqft <= 1000): maxSameDayShoots = 3; break;
            case (sqft <= 1500): maxSameDayShoots = 2; break;
            case (sqft >= 2500): maxSameDayShoots = 0; break;
        }
        if (!virtualTour.checked || maxSameDayShoots < 1) { //can potentially fit one more shoot per day with no virtual tours
            maxSameDayShoots++;
        }
    } else {
        disableSameDayShoots.hidden = false;
    }
    if (sameDayShoots.value > maxSameDayShoots) { //clamp input
        sameDayShoots.value = maxSameDayShoots;
        document.getElementById("bulk-message").textContent = "The max for your quote is " + maxSameDayShoots.toString() + ". Please contact us for multi-day bulk quotes or more precise bulk pricing.";
    } else {
        document.getElementById("bulk-message").textContent = "";
    }
    
    //set days until shoot(s)
    if (sameDayShoots.value > 1) {
        daysUntilShoot.value = 7;
        disableDaysUntilShoot.hidden = false;
        document.getElementById("when-message").textContent = "Contact us for a more custom quote for rushed scheduling in this configuration.";
    } else {
        disableDaysUntilShoot.hidden = true;
        document.getElementById("when-message").textContent = "";
    }

    //show quote results
    totalCost.textContent = String(quote);

}

//set defaults
squareFootageInput.value = 500;
daysUntilShoot.value = 3;
sameDayShoots.value = 1;
hdrPhotography.checked = true;
videoType.checked = false;
virtualTourType.checked = false;
disableFirstTimeDiscount.hidden = false;

updateFields();

//Step Counter
$(document).ready(function () {
    $(".minus").click(function () {
    var $input = $(this).parent().find("input");
    var count = parseInt($input.val()) - 1;
    count = count < 1 ? 1 : count;
    $input.val(count);
    $input.change();
    return false;
    });
    $(".plus").click(function () {
    var $input = $(this).parent().find("input");
    var count = parseInt($input.val()) + 1;
    count = count > 99 ? 99 : count;
    $input.val(count);
    $input.change();
    return false;
    });
});

function validAddress(adress) { //TODO
    return;
}

//Calculation
function calculateChange() {
    
    updateFields(); //make sure all values are correct before beginning calculation
    quote = 0;

    //check if fields necessary for calculation are filled
    var coreServiceSelected = hdrPhotography.checked || dronePhotography.checked || promotionalVideo.checked || virtualTour.checked;
    if (!coreServiceSelected) {
        quote = "";
        errorText.textContent = "At least one core service needs to be selected.";
        errorText.hidden = false;
        return;
    }
    if (!validAddress(propertyAddress.value)) {
        quote = "";
        errorText.textContent = "Property address invalid.";
        errorText.hidden = false;
        return;
    }
    if (virtualTour.checked && virtualTourType.checked) {
        if (squareFootage / 250 * sameDayShoots.value < 10) {
            quote = "";
            errorText.textContent = "Zillow Tours are a bulk service, requiring at least 10 rooms (estimated 300sqft/rm). Adjust the input square footage or bulk amount.";
            errorText.hidden = false;
            return;
        }
    }

    //assess base charges based on property size
    var pricePerSquareFoot = 0;
    var squareFootage = squareFootageInput.value;
    switch (true) {
        case (squareFootage < 1500):
            pricePerSquareFoot = 0.16;
            break;
        case (squareFootage < 3000):
            pricePerSquareFoot = 0.15 + (0.16 - 0.15) * (1 - (squareFootage - 1500) / (3000 - 1500));
            break;
        case (squareFootage < 6000):
            pricePerSquareFoot = 0.12 + (0.15 - 0.12) * (1 - (squareFootage - 3000) / (6000 - 3000));
            break;
        default:
            pricePerSquareFoot = 0.12;
            break;
    }

    //attenuate base charge based on core service and assign combo pricing
    var photoPrice = 0;
    var videoPrice = 0;
    var tourPrice = 0;
    if (!virtualTour.checked) {
        if (!hdrPhotography.checked) {
            if (promotionalVideo.checked) {  //videos as base (only thing selected)
                if (videoType.checked) {
                    pricePerSquareFoot = pricePerSquareFoot * 1.75; //video walkthrough
                    videoPrice = pricePerSquareFoot * squareFootage;
                } else {
                    pricePerSquareFoot = pricePerSquareFoot * 1.25; //video highlights
                    videoPrice = pricePerSquareFoot * squareFootage;
                }
            }
        } else {
            pricePerSquareFoot = pricePerSquareFoot / 1.5; //photos as base
            photoPrice = pricePerSquareFoot * squareFootage;
            if (promotionalVideo.checked && videoType.checked) {
                videoPrice = photoPrice * 2.25;
            } else if (promotionalVideo.checked && !videoType.checked) {
                videoPrice = photoPrice * 1.75;
            }
        }
    } else { //virtual tour as base
        var basePrice = pricePerSquareFoot * squareFootage;
        if (!virtualTourType.checked) {
            if (generateFloorPlan.checked) {
                tourPrice = basePrice + Math.ceil(squareFootage / 4000) * 25;
            } else {
                tourPrice = basePrice;
            }
        } else {
            tourPrice = (squareFootage / 250) * 20; //Zillow Tour pricing model
        }
        if (hdrPhotography.checked && squareFootage < 2500) {
            photoPrice = 100;
        } else if (hdrPhotography.checked) {
            photoPrice = max(125, basePrice / 4);
        }
        if (promotionalVideo.checked && videoType.checked) {
            videoPrice = basePrice * 1.5;
        } else if (promotionalVideo.checked && !videoType.checked) {
            videoPrice = basePrice;
        }
    }

    var dronePrice = 300;
    if (squareFootage > 6000) {
        dronePrice = 400;
    }

    //calculate fees
    if (previousAddress != propertyAddress) {
        var extraTravelFee = 0;
        var travelTime = 0; //TODO: integrate travel time api
        var serviceAreaThreshold = 2700; //in seconds
        if (travelTime > serviceAreaThreshold) {
            extraTravelFee = Math.floor((travelTime - serviceAreaThreshold)/60)*1.50; //$1.50 per extra minute of travel
        }
        previousAddress = propertyAddress;
    }
    var rushScheduleFee = 0;
    if (daysUntilShoot.value < 3) {
        rushScheduleFee = 35;
    } else if (daysUntilShoot.value < 6) {
        rushScheduleFee = 15;
    }
    var shortNoticeFee = 0;
    var noticeThreshold = 3; //in days
    if (daysUntilShoot.value < 3) {
        shortNoticeFee = 30;
    }
    fees = rushScheduleFee + extraTravelFee + shortNoticeFee;

    //calculate discount
    subtotal = photoPrice + dronePrice + videoPrice + tourPrice;
    if (firstTimeDiscount.checked) {
        var photoDiscount = 0.25
        if (tourPrice > 0) photoDiscount = 0.5;
        quote = Math.floor((photoDiscount * photoPrice) + (0.25 * dronePrice) + (0.25 * videoPrice) + (0.5 * tourPrice));
    } else if (subscriberDiscount.checked) {
        quote = Math.floor(0.1 * subtotal);
    } else {
        quote = Math.floor(subtotal);
    }
    discount = subtotal - quote;

    updateFields(); //page needs to reflect changes from calculations
    return;

}

//call functions
var elements = [squareFootageInput, hdrPhotography, dronePhotography, promotionalVideo, 
                virtualTour, daysUntilShoot, sameDayShoots, videoType, virtualTourType, 
                propertyAddress, generateFloorPlan, firstTimeDiscount, subscriberDiscount];
elements.forEach(function(element) {
    element.onchange = function() {
        calculateChange();
    };
});


//active form field
$(".email-field").on("focusin", function () {
    $(this).siblings(".field-label").addClass("active");
});
$(".email-field").on("focusout", function () {
    if ($(this).val().length == 0) {
    $(this).siblings(".field-label").removeClass("active");
    }
});