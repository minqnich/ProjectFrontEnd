"use strict";

function removeDollarSign(str) {
    // Check if the string starts with '$'
    if (str.startsWith('$')) {
        // If it does, remove the first character (which is '$')
        return Number(str.slice(1));
    } else {
        // If it doesn't start with '$', return the string as it is
        return Nan;
    }
}

const cartBtn = document.querySelector("#cartBtn")
const cartBox = document.querySelector(".cart_box")

cartBtn.addEventListener("click" , (e) => {
    e.preventDefault()
    cartBox.classList.toggle("display")
})


const basedPrice = document.querySelector(".total_price")
const productPrice = removeDollarSign(basedPrice.innerHTML)

const discountedPrice = document.querySelector(".discount_price")
const discountPrice = removeDollarSign(basedPrice.innerHTML)

const productQtyBox = document.querySelector(".qty_number")

const increamentBtn = document.querySelector(".increament")
increamentBtn.addEventListener("click", () => {
    productQtyBox.innerHTML++
    let price = removeDollarSign(basedPrice.innerHTML)
    const calculatedBasedPrice = price + productPrice
    basedPrice.innerHTML = "$" + calculatedBasedPrice
    
    let price2 = removeDollarSign(discountedPrice.innerHTML)
    const calculateddiscountedPrice = price2 + discountPrice
    discountedPrice.innerHTML = "$" + calculateddiscountedPrice 
    
})

const decreamentBtn = document.querySelector(".decreament")
decreamentBtn.addEventListener("click",()=>{
    productQtyBox.innerHTML--
    if(productQtyBox.innerHTML<1){
        productQtyBox.innerHTML=1
        return
    }
    let price = removeDollarSign(basedPrice.innerHTML)
    const calculatedBasedPrice = price - productPrice
    basedPrice.innerHTML = "$" + calculatedBasedPrice

    let price2 = removeDollarSign(discountedPrice.innerHTML)
    const calculateddiscountedPrice = price2 - discountPrice
    discountedPrice.innerHTML = "$" + calculateddiscountedPrice 
} )
const ProContainer = document.querySelector(".pro_content")
const addCart = document.querySelector(".add_cart")
const qtyLabel = document.querySelector(".qty_label")
const cart_empty = document.querySelector(".cart_empty")
const remove = document.querySelector(".trash")
addCart.addEventListener("click",()=>{

    qtyLabel.style.display="block"
    qtyLabel.innerHTML = productQtyBox.innerHTML
    ProContainer.style.display="flex"
    ProContainer.innerHTML = ""
    
    let html = `<img src="/public/img/G1.jpg">
    <div class="p_details">
      <p class="pro_txt">God of War™ Ragnarök</p>
      <p class="price">$31.5 <span>x</span> <span class="times"> ${productQtyBox.innerHTML}</span>
      <span class="total">= ${discountedPrice.innerHTML}</span>                
      </p>             
    </div>`;
ProContainer.insertAdjacentHTML("afterbegin", html)
cart_empty.innerHTML = "";
remove.addEventListener("click", () => {
    ProContainer.innerHTML = ""
    cart_empty.innerHTML = "Your Cart is empty"
    qtyLabel.style.display = "none"
});

})




