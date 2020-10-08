const mealsElemtnt = document.getElementById('meals');
const favContainer = document.getElementById('fav-meals');

const serchTerm = document.getElementById('serch-term');
const mealInfoEl = document.getElementById('meal-info');
const serchBtn = document.getElementById('serch');
const mealPopup = document.getElementById('meal-popup');
const popupClsBtn = document.getElementById('close-popup');

getRandomMeal();
featchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const resData = await resp.json();
    const randomMeal = resData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal, true);
}

async function getMealById(id) {
   const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
   const respBySerch = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s="+term);
    const respDataBySerch = await respBySerch.json();

    const meals = respDataBySerch.meals;

    return meals;

}


function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
    <div class="meal-header">
        ${random ? `
        <span class="random">
            Random Recipes
        </span>` : '' }

        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn">
            <i class="fas fa-heart"></i>
        </button>
    </div>

`;
    const btn = meal.querySelector(".meal-body .fav-btn");

   
   btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealFromLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealToLS(mealData.idMeal);
            btn.classList.add("active");
        }
        
        featchFavMeals();

    });
    meal.addEventListener("click", ()=> {
        showMealInfo(mealData);
    });
    mealsElemtnt.appendChild(meal);
}

function addMealToLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}
async function featchFavMeals() {
      //clean the container
      favContainer.innerHTML = "";
    const mealIds = getMealsFromLS();
    const meals = [];

    for(let i=0;i<mealIds.length;i++){
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
     addMealToFav(meal);
    }
}
function addMealToFav(mealData) {
  
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}"
     alt="${mealData.strMeal}">
     <span>${mealData.strMeal}></span>
     <button class="clear"><i class="fas fa-window-close"></i></button>
              
`;
    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", ()=>{
        removeMealFromLS(mealData.idMeal);
        
        featchFavMeals();
    });
    favMeal.addEventListener("click", () =>{
        showMealInfo(mealData);
    })

    favContainer.appendChild(favMeal);
}


function showMealInfo(mealData) {
    //clean it up
    mealInfoEl.innerHTML = '';
    //update meal info
    const mealEl = document.createElement('div');

    const ingredients = [];
    for(let i=1;i<=20;i++){
        if(mealData['strIngredient'+i]){
            ingredients.push(`${mealData
                ["strIngredient" + i]} / ${mealData
                    ["strMeasure" + i]}
            `)
        }else{
            break;
        }
    }

    mealEl.innerHTML = `
            <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}" 
            alt="image">
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients
                    .map(
                        (ing) => `
                <li>${ing}</li>
                `
                    )
                    .join("")}
            </ul>
            <h3>Procedure</h3>
            <p>
            ${mealData.strInstructions}
            </p>
        
         
           
    `;

    mealInfoEl.appendChild(mealEl);
    mealPopup.classList.remove('hidden');
}


serchBtn.addEventListener("click", async() =>{
    mealsElemtnt.innerHTML = "";
    const serch = serchTerm.value;

    const meals = await getMealsBySearch(serch);
    if(meals){
        meals.forEach((meal)=> {
        addMeal(meal);
            })
        }   
});

popupClsBtn.addEventListener("click", ()=>{
    mealPopup.classList.add("hidden");
})