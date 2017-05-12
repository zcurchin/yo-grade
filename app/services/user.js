import Ember from 'ember';
import RSVP from 'rsvp';

const {
  Service,
  inject: { service },
  get
} = Ember;


export default Service.extend({
  session: service(),
  firebaseApp: service(),
  firebaseUtil: service(),

  restaurant: '',

  create(params){
    let self = this;

    return new RSVP.Promise((resolve, reject) => {
      self.isUsernameTaken(params.username).then(() => {
        console.log('##### 1 : isUsernameTaken');
        return true;

      }).then(() => {
        console.log('##### 2 : _createFirebaseUser');

        return self._createFirebaseUser(params.email, params.password).then((user) => {
          let uid = user.uid;
          let tasks = {
            account: self._createAccount(uid, params),
            profile: self._createProfile(uid, params)
          };

          console.log('##### 3 : created : firebase user');

          return RSVP.hash(tasks).then(() => {
            resolve();
          });
        });

      }).catch(error => {
        reject(error);
      });
    });
  },


  destroy(){},


  get(dataKey){
    let session = get(this, 'session');
    let currentUser = session.get('currentUser');
    let auth = session.get('isAuthenticated');
    let uid = currentUser.uid;
    let firebaseUtil = get(this, 'firebaseUtil');

    let dbRef;

    switch (dataKey) {
      case 'profile':
        dbRef = 'userProfiles';
      break;
      case 'account':
        dbRef = 'userAccounts';
      break;
      case 'publicGrades':
        dbRef = 'publicGrades';
      break;
      case 'privateGrades':
        dbRef = 'privateGrades';
      break;
    }

    console.log('# User : get : '+dbRef+' :', uid);

    return new RSVP.Promise((resolve, reject) => {
      firebaseUtil.findRecord(dbRef, dbRef + '/' + uid).then(data => {
        resolve(data);

      }).catch(error => {
        reject(error);
      });
    });
  },


  // --------------------------------------------
  // Checking
  // --------------------------------------------

  checkIn(checkOut){
    let self = this;
    let firebaseApp = get(this, 'firebaseApp');
    let checkIns = firebaseApp.database().ref('checkIns');
    let uid = get(this, 'session.currentUser.uid');

    let data = {
      in: Date.now(),
      out: 1494018844923,
      restaurant: self.restaurant
    };

    self.getLastCheckIn().then(data => {
      console.log(data.val());
    });

    self.getCheckIns().then(data => {
      console.log(data.val());
    });

    return checkIns.child(uid).push(data);
  },


  checkOut(){
    this.getLastCheckIn().then(data => {
      let uid = get(this, 'session.currentUser.uid');
      let checkIn_id = Object.keys(data.val())[0];
      let firebaseApp = get(this, 'firebaseApp');
      let checkInRef = firebaseApp.database().ref('checkIns/'+uid+'/'+checkIn_id);

      checkInRef.update({
        in: 'World'
      });


      //console.log(Object.keys(data.val())[0]);
      // data.ref().set({
      //   hallo: 'World'
      // }).then(() => {
      //   console.log('FFFF');
      // });
    });
  },


  getCheckIns(){
    let firebaseApp = get(this, 'firebaseApp');
    let uid = get(this, 'session.currentUser.uid');
    let checkIns = firebaseApp.database().ref('checkIns');
    let userCheckins = checkIns.child(uid);

    return userCheckins.orderByKey().once('value');
  },


  getLastCheckIn(){
    let firebaseApp = get(this, 'firebaseApp');
    let uid = get(this, 'session.currentUser.uid');
    let checkIns = firebaseApp.database().ref('checkIns');
    let userCheckins = checkIns.child(uid);

    return userCheckins.orderByKey().limitToLast(1).once('value');
  },


  // --------------------------------------------
  // Create Firebase User
  // --------------------------------------------

  _createFirebaseUser(email, pass){
    let auth = get(this, 'firebaseApp').auth();

    return auth.createUserWithEmailAndPassword(email, pass);
  },


  // --------------------------------------------
  // Create Basic User
  // --------------------------------------------

  _createAccount(uid, params){
    let firebaseApp = get(this, 'firebaseApp');
    let userAccounts = firebaseApp.database().ref('userAccounts');

    let data = {
      created: Date.now(),
      updated: '',
      type: params.admin ? 'admin' : 'user'
    };

    return userAccounts.child(uid).set(data);
  },


  _createProfile(uid, params){
    let firebaseApp = get(this, 'firebaseApp');
    let userProfiles = firebaseApp.database().ref('userProfiles');

    let data = {
      created: Date.now(),
      updated: '',
      first_name: params.first_name,
      last_name: params.last_name,
      username: params.username,
      country: '',
      state: '',
      city: '',
      zipcode: '',
      profile_image: '',
      restaurant: ''
    };

    return userProfiles.child(uid).set(data);
  },


  // --------------------------------------------
  // Create Admin User
  // --------------------------------------------

  _createAdminAccount(auth_uid, email){
    console.log(auth_uid, email);
  },


  // --------------------------------------------
  // Update Email
  // --------------------------------------------

  updateEmail(address){
    //let self = this;
    let currentUser = get(this, 'session.currentUser');

    return new RSVP.Promise((resolve, reject) => {
      currentUser.updateEmail(address).then(data => {
        console.log('# User : Email Updated :', address);
        console.log(data);
        resolve(data);

      }).catch(error => {
        reject(error);
      });
    });
  },

  // --------------------------------------------
  // Helpers
  // --------------------------------------------

  isUsernameTaken(username){
    let firebaseApp = get(this, 'firebaseApp');
    let userProfiles = firebaseApp.database().ref('userProfiles');

    return new RSVP.Promise((resolve, reject) => {
      userProfiles.orderByChild('username').equalTo(username).once('value').then(d => {
        if (d.val()) {
          console.log('--- isUsernameTaken : ', true);
          reject({ message: 'This username is already taken' });
        } else {
          console.log('--- isUsernameTaken : ', false);
          resolve();
        }
      });
    });
  }
});