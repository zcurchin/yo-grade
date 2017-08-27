import Ember from 'ember';

const {
  Controller,
  inject: { controller }
} = Ember;

export default Controller.extend({
  app_controler: controller('application'),

  actions: {
    signUpRestaurant(){
      console.log('##### signUpRestaurant');
    },

    cancel(){
      this.transitionToRoute('sign-in');
    }
  }
});
