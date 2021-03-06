import Ember from 'ember';

const {
  Component,
  observer,
  get,
  set
} = Ember;

export default Component.extend({
  active: false,
  confirmAction: null,

  waiting: false,
  success: false,
  error: false,
  successMsg: '',
  errorMsg: '',


  onDialogClose: observer('active', function(){
    let active = get(this, 'active');

    if (!active) {
      this.closeActions();
    }
  }),


  willDestroyElement() {
    this._super(...arguments);

    this.closeActions();
  },


  closeActions(){
    set(this, 'waiting', false);
    set(this, 'success', false);
    set(this, 'error', false);
  },


  actions: {
    closeDialog(){
      set(this, 'active', false);
      this.closeActions();
      if (this.onClose) { this.onClose(this); }
    },


    closeActions(){
      this.closeActions();
    },


    confirm(){
      this.confirmAction(this);
    }
  }
});
