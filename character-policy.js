'use strict';
const limited=h=>!!(h&&(h.event||h.limited||h.limitedEdition||h.availability==='limited'));
const regular=heroes=>heroes.filter(h=>!limited(h));
module.exports={limited,regular};
