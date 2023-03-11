let eventBus = new Vue()
Vue.component('product-review', {
    template: `
<form class="review-form" @submit.prevent="onSubmit">
<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>
 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>
 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>
 <p>«Would you recommend this product?».</p>
 <div class="p">
       <label for="positive">Yes</label>    
       <input v-model="answer" type="radio" id="positive" name="answer" value="positive">
       <label for="positive">No</label>
       <input v-model="answer" type="radio" id="negative" name="answer" value="negative">
   <br>
</div>
 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
 <p>
   <input type="submit" value="Submit">
   <input type="reset" value="Reset">
 </p>
</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            answer: null,
            errors: [],

        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.answer) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    answer: this.answer
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.answer = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.answer) this.errors.push("You would recommend or not?!")
            }
        }
    }
})

Vue.component('product', {
    template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>
       <div class="product-info">
           <h1>{{ title }}</h1>
           <a v-bind:href="link"></a>
           <p v-if="inventory > 10">In stock</p>
           <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
           <p v-else class="text-decoration">Out of stock</p>
          <p>Shipping: {{ shipping }}</p>
          <product-details :details="details"></product-details>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
           
           <ul>
               <li v-for="size in sizes">{{ size }}</li>
           </ul>
          
           <button class="addToCart"
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Добавить
           </button>
           
           <button class="reduceToCart"
                   v-on:click="reduceToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Убавить
           </button><br>
           <br><a v-bind:href="link">{{altText}}</a>
       </div>
       <product-tabs :reviews="reviews"></product-tabs>
    </div>    
 `,
    data() {
        return {
            product: "Носочки",
            brand: 'Тарковские',
            selectedVariant: 0,
            inventory: 100,
            description: "A pair of warm, fuzzy socks",
            altText: "A pair of socks", link: "https://www.amazon.com/s/ref=nb_sb_noss?",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    onSale: true,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    onSale: false,
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        reduceToCart() {
            this.$emit('reduce-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }
    },
    computed: {
        title() {
            if (this.variants[this.selectedVariant].onSale){
                return this.brand + ' ' + this.product + ' ' + 'Sale';
            }else {
                return this.brand + ' ' + this.product;
            }

        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },

    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
 `,
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
     <div>
      
        <ul>
          <span class="tab" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                  <button class="delReview"
                   v-on:click="delReview(index)"
                  >
                   delReview
                  </button>
                </li>
            </ul>
        </div>
        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>

      </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    },
    methods: {
        delReview: function(index) {
            this.reviews.splice(index, 1);
        },
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        details: true,
        cart: []
    },
    methods: {
        delReview(index) {
            this.delReview.pop(index);
        },
        updateCart(id) {
            this.cart.push(id);
        },
        reduceToCart(id) {
            this.cart.pop(id);
        }
    }
})