'use strict';


// ========== Setup/Startup: ========== //

// Initializes TeamStock.
// All functionality is encapsulated 
function TeamStock() {
    //DISABLE CONSOLE FOR PRODUCTION, COMMENT FOR DEBUG MODE:
//    var console = {};
//    console.log = function(){};
//    window.console = console;
    //END CONSOLE DISABLE
    
    this.checkSetup();
    
    // Database Prefix:
    this.prefix = extractDomain(window.location.href.replace(/\./g,'_'))+'/';
    console.log('Env: '+'this.prefix');

    // Shortcuts to DOM Elements:
    this.body = document.getElementById('body');
        // Containers
    this.appContainer = document.getElementById('app-container');
    this.drawerContainer = document.getElementById('drawer-container');
    this.sidebarTeamsContainer = document.getElementById('sidebar-planners');
    this.teamsContainer = document.getElementById('sidebar-nav');
    this.itemList = document.getElementById('item-list');
        // Auth
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
        // Control
            // Sidebar
    this.sidebarSigninPrompt = document.getElementById('sidebar-sign-in-prompt');
    this.editTeamsButton = document.getElementById('edit-planners');
    this.sidebarAddTeamButton = document.getElementById('drawer-planner-add');
            // App
    this.selectedTeamlabel = document.getElementById('selected-planner');
    this.searchBar = document.getElementById('search');
    this.addButton = document.getElementById('add');
    this.addCategoryButton = document.getElementById('add-category');
    this.addItemButton = document.getElementById('add-task');    
    this.createRequestButton = document.getElementById('create-request');
            // Item Modal
    this.itemModal = document.getElementById('item-modal');
    this.itemModalContent = document.getElementById('item-modal-container');
    this.itemModalChanges = document.getElementById('item-modal-changes');
    this.itemModalName = document.getElementById('itemName');
    this.itemModalCategory = document.getElementById('itemCategory');
    this.itemModalDescription = document.getElementById('itemDescription');
    this.itemModalDeadline = document.getElementById('itemDeadline');
    this.itemModalDuration = document.getElementById('itemDuration');
    this.itemModalCheckbox = document.getElementById('itemCheckbox');
    this.itemModalCancelButton = document.getElementById('item-modal-cancel');
    this.itemModalDoneButton = document.getElementById('item-modal-done');
            // Settings Modal
    this.settingsModal = document.getElementById('settings-modal');
    this.settingsModalCancelButton = document.getElementById('settings-modal-cancel');
    this.settingsModalDoneButton = document.getElementById('settings-modal-done');
    this.settingsModalDeleteItemButton = document.getElementById('settings-modal-delete-item');
    this.settingsModalDeleteCategoryButton = document.getElementById('settings-modal-delete-category');
    this.settingsModalContent = document.getElementById('settings-modal-container');
    this.settingsModalAdmin = document.getElementById('settings-modal-admin-container');
    this.settingsModalUserTeam = document.getElementById('settings-user-planner');
    this.settingsModalWebhook = document.getElementById('settings-webhook');
    this.settingsModalChannel = document.getElementById('settings-channel');
    this.settingsModalSlackEnabled = document.getElementById('settings-slack-enabled');
    this.settingsModalTeams = document.getElementById('settings-planners');
    this.settingsModalUsers = document.getElementById('settings-modal-user-container');
    
    // UI Event Listeners:    
        //Search bar
    this.searchBar.addEventListener('keydown', this.search.bind(this));
    
    //Wire up buttons:
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));
        // Add Menu
    this.addItemButton.addEventListener('click', this.addItem.bind(this));
    this.addCategoryButton.addEventListener('click', this.addCategory.bind(this));
        //Sidebar
    this.editTeamsButton.addEventListener('click', this.showSettingsModal.bind(this));
        //Modals
    this.itemModalCancelButton.addEventListener('click', this.hideItemModal.bind(this));
    this.settingsModalCancelButton.addEventListener('click', this.hideSettingsModal.bind(this));
    this.settingsModalDeleteCategoryButton.addEventListener('click', this.deleteCategory.bind(this));
    this.settingsModalDeleteItemButton.addEventListener('click', this.deleteItem.bind(this));

    this.initFirebase();  

    
}

/* HTML Templates */
TeamStock.prototype.listCategoryTemplate =' \
        <li id="li-cat-$CLASSNAME" class="mdl-list__item"> \
            <span class="mdl-list__item-primary-action"> \
                <span class="mdl-list__item-primary-content"> \
                    <i class="material-icons  mdl-list__item-avatar">class</i> \
                    <h4>$NAME</h4> \
                </span> \
            </span> \
        </li> \
        <div id="cat-$NAME" class="mdl-list"> \
        </div>\
';

TeamStock.prototype.listItemTemplate = ' \
        <li  id="li-item-$CLASSNAME" class="mdl-list__item">\
            <span class="mdl-list__item-secondary-action"> \
                <span class="mdl-list__item-secondary-content"> \
                    <h5> \
                        <i id="item-icon-$CLASSNAME" class="material-icons">assignment</i> \
                        $NAME \
                        <i hidden class="material-icons">check</i> \
                    </h5> \
                </span> \
            </span> \
        </li> \
';

TeamStock.prototype.itemModalTeamTemplate =' \
        <li class="mdl-list__item">\
            <span id="li-team-$NAME" class="mdl-list__item-secondary-action"> \
                <span class="mdl-list__item-secondary-content"> \
                    <h5> \
                        <i id="team-icon-$NAME" class="material-icons mdl-badge mdl-badge--overlap" data-badge="$NUM">business_center</i> \
                        $NAME \
                        <button hidden id="$NAME-plus"> \
                            <i class="material-icons">exposure_plus_1</i> \
                        </button> \
                        <button hidden id="$NAME-minus"> \
                            <i class="material-icons">exposure_neg_1</i> \
                        </button> \
                    </h5> \
                </span> \
            </span> \
        </li> \
';

TeamStock.prototype.settingsModalTeamTemplate =' \
        <li class="mdl-list__item">\
            <span id="li-team-$NAME" class="mdl-list__item-secondary-action"> \
                <span class="mdl-list__item-secondary-content"> \
                    <h4> \
                        <i class="material-icons">group</i> \
                        $NAME \
                        <button id="team-$NAME-del"> \
                            <i class="material-icons">delete</i> \
                        </button> \
                    </h4> \
                </span> \
            </span> \
        </li> \
';

TeamStock.prototype.modalUserTemplate =' \
        <li id="li-user-$ID" class="mdl-list__item"> \
            <span class="mdl-list__item-primary-action"> \
                <span class="mdl-list__item-primary-content"> \
                    <i class="material-icons  mdl-list__item-avatar">account_circle</i> \
                    <h4> \
                        $NAME - <i>$EMAIL</i>\
                        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="user-toggle-$ID"> \
                            <span class="mdl-checkbox__label">Enabled:</span> \
                            <input type="checkbox" id="user-toggle-$ID" class="mdl-checkbox__input"> \
                        </label> \
                        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="admin-toggle-$ID"> \
                            <span class="mdl-checkbox__label">Admin:</span> \
                            <input type="checkbox" id="admin-toggle-$ID" class="mdl-checkbox__input"> \
                        </label> \
                    </h4> \
                </span> \
            </span> \
        </li> \
';

TeamStock.prototype.drawerItemTemplate =' \
        <a id="drawer-team-$NAME" class="mdl-navigation__link"> \
            <i class="material-icons">group</i> \
            $NAME \
        </a> \
';
/*================*/

// ========== Firebase/Init Functions ========== //

// Checks if Firebase has been initialized properly
TeamStock.prototype.checkSetup = function () {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
        console.error('You have not configured and imported the Firebase SDK. ' +
                'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
        console.error('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
                'actually a Firebase bug that occurs rarely. ' +
                'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
                'and make sure the storageBucket attribute is not empty. ' +
                'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
                'displayed there.');
    }
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
TeamStock.prototype.initFirebase = function () {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

// ========== UI Functions: ========== //

// Enable/Disable core UI elements (For auth/modals)
TeamStock.prototype.setControlState = function(isEnabled) {
    this.addButton.disabled = !isEnabled;
    this.searchBar.disabled = !isEnabled;
    this.itemList.disabled = !isEnabled;
}

// Prompt the user to create a new category
TeamStock.prototype.addCategory = function() {
    if(!this.activeTeam) {
        toastr.error("Please create or select a planner first!");
        return;
    }
    
    this.dbSaveCategory.bind(this)(
        {
            'name': window.prompt('Enter category name:').toUpperCase(),
            'description': window.prompt('Enter category description:')
        });
}

// Prompt the user to create a new item
TeamStock.prototype.addItem = function() {
    this.showItemModal.bind(this)(null);
}

// Clears categories and items from list
TeamStock.prototype.clearList = function() {
    this.itemList.innerHTML = '';
}

// Add a category to the main list
TeamStock.prototype.appendListCategory = function(cat) {
    this.itemList.innerHTML += this.listCategoryTemplate
        .replace(/\$NAME/g, cat)
        .replace(/\$CLASSNAME/g, cat.replace(/\"| /g, "_"));
}

// Add an item to the main list
TeamStock.prototype.appendListItem = function(item) {
    console.log(item);
    var listContainer = document.getElementById('cat-'+item.category.replace(/\"| /g, "_"));
    if(!listContainer) {
        console.log("No such category "+item.category+". Skipping item "+item.name);
        return;
    }
    listContainer.innerHTML += this.listItemTemplate
        .replace(/\$CLASSNAME/g, item.name.replace(/\"| /g, "_"))
        .replace(/\$NAME/g, item.name);
    // Delay button wiring to ensure ample time for html content to be changed.
    setTimeout(function() {
        var listItem = document.getElementById('li-item-'+item.name.replace(/\"| /g, "_"));
        
        listItem.addEventListener('click', function() {
//            console.log('Opening item modal');
//            this.showItemModal.bind(this)(item);
            $(listItem).slideUp();
        }.bind(this));
        
        
        var itemsRef = this.database.ref(this.prefix + 'items/'+item.name+'/distribution');
        itemsRef.off('value');
        itemsRef.on('value', function(snapshot) {
            if(!snapshot.val()) {
                console.error('ERROR: Updated item missing from list');
            }
            var icon = document.getElementById('item-icon-'+item.name.replace(/\"| /g, "_"));
        }.bind(this));
        
    }.bind(this), 500);
}

// Filter categories/items based on current value in searchbar
TeamStock.prototype.search = function(keyEvent) {
    // Return if key is not enter or backspace or delete
    if(keyEvent.which != 13) {
        return;
    }
    
    var query = this.searchBar.value;
    
    if(query.length == 0) {
        $('[id^=li-cat-]').slideDown(250);
        $('[id^=cat-]').slideDown(250);
        $('[id^=li-item-]').slideDown(250);
    }else if(query == query.toUpperCase()) {
        // Filter by category
        $('[id^=li-cat-]').slideUp(250);
        $('[id^=cat-]').slideUp(250);
        setTimeout(function() {
            $('[id^=li-cat-'+query+']').slideDown(250);
            $('[id^=cat-'+query+']').slideDown(250);
        }.bind(this),250);
    } else {
        // Filter by category
        $('[id^=li-item-]').slideUp(250);
        setTimeout(function() {
            $('[id^=li-item-'+query+']').slideDown(250);
        }.bind(this),250);
    }
}

// Load drawer/sidebar teams list
TeamStock.prototype.loadSidebarContents = function() {
    this.sidebarAddTeamButton.addEventListener('click', function() {
        this.addTeam.bind(this)();
    }.bind(this));
    
    var teamsRef = this.database.ref(this.prefix + 'teams');
    teamsRef.off('value');
    teamsRef.on('value', function(snapshot) {
        this.sidebarTeamsContainer.innerHTML = '';
        Object.keys(snapshot.val()).forEach(function (teamId) {
            var teamName = snapshot.val()[teamId].name;
            console.log('NAME: '+teamName);
            this.sidebarTeamsContainer.innerHTML += this.drawerItemTemplate
                .replace(/\$NAME/g, teamName);
            setTimeout(function() {
                document.getElementById('drawer-team-'+teamName).addEventListener('click', function() {
                    setTimeout(function() {
                        var activeTeam = snapshot.val()[teamId];
                        activeTeam.id = teamId;
                        this.setActiveTeam.bind(this)(activeTeam);
                    }.bind(this), 100);
                }.bind(this));
            }.bind(this),100);
        }.bind(this));
    }.bind(this));
}

// Sets and displays the team whose inventory is visible in the main list
TeamStock.prototype.setActiveTeam = function(team) {
    if(this.teamChangeCooldown) {
        toastr.error("Please wait a moment before switching teams again...");
        return;
    }
    
    this.teamChangeCooldown = true;
    setTimeout(function () {
        this.teamChangeCooldown = false;
    }.bind(this),1000);
    
    var teamName = team && team.name || null;
    
    this.activeTeam = team;
    this.selectedTeamlabel.innerHTML = teamName || "None";
    this.dbLoadItems.bind(this)();
    if(teamName) {
        toastr.success("Switched to team "+teamName || "None");
    }
}

/* Admin UI: */

// Prompts the user to add a new team
TeamStock.prototype.addTeam = function() {
    if(!this.activeTeam) {
        toastr.error("Please create or select a planner first!");
    }
    this.dbSaveTeam.bind(this)(
        {
            'name': window.prompt('Enter planner name:').toUpperCase(),
            'tasks': [{
                'name': 'NullTask',
                'category': '',
                'description': 'Ensures task list is initialized in database',
                'deadline': '',
                'duration': 0
            }]
        });
}

// Prompts the user to delete a category 
TeamStock.prototype.deleteCategory = function() {
        
    var delCategory = window.prompt('Enter the name of the category to delete\nTHIS CANNOT BE UNDONE').toUpperCase();
    
    this.dbCheckCategory.bind(this)(delCategory, function() {
        // Category exists
        var mvCategory = window.prompt('Which category would you like to move the items in ' + delCategory + 'to?').toUpperCase();
        if(mvCategory == delCategory) {
            mvCategory = '';
        }
        this.dbCheckCategory.bind(this)(mvCategory, function() {
            // Category exists
            var itemsRef = this.database.ref(this.prefix + 'items');
            itemsRef.once('value').then(function(snapshot) {
                if(!snapshot.val()) {
                    return;
                }
                Object.keys(snapshot.val()).forEach(function(itemName) {
                    if(snapshot.val()[itemName]['category'] == delCategory) {
                        console.log('moving '+itemName+' from '+delCategory+' to '+mvCategory);
                        itemsRef.child(itemName).update({
                            'category': mvCategory
                        });
                    }
                }.bind(this));
                toastr.success('Successfully deleted category '+delCategory+' and moved all items to '+mvCategory);
                this.slack.bind(this)(this.auth.currentUser.displayName.split(' ')[0]+' deleted category '+delCategory+' and moved all items to '+mvCategory);
            }.bind(this));
            var catsRef = this.database.ref(this.prefix + 'categories/'+delCategory);
            catsRef.remove();
            setTimeout(this.dbLoadItems.bind(this), 100);
        }.bind(this), function() {
            // Category DNE
            toastr.error('No such category '+mvCategory+'! Please specify an existing category or try a different one.');
        }.bind(this));
    }.bind(this), function() {
        // Category DNE
        toastr.error('No such category '+delCategory+'! Please specify an existing category or try a different one.');
    }.bind(this));
}

// Pompts the user to delete an item
TeamStock.prototype.deleteItem = function() {
    var delItem = window.prompt('Enter the name of the item you would like to delete:\nTHIS CANNOT BE UNDONE').toLowerCase();

    this.dbCheckItem.bind(this)(delItem, function() {
        // Item exists
        var itemRef = this.database.ref(this.prefix + 'items/'+delItem);
        itemRef.once('value').then(function(snapshot) {
            itemRef.remove();
            this.slack.bind(this)(this.auth.currentUser.displayName.split(' ')[0]+' deleted item '+delItem);
        }.bind(this));
        setTimeout(this.dbLoadItems.bind(this), 100);
    }.bind(this), function() {
        // Category DNE
        toastr.error('No such item '+delItem+'! Please specify an existing category or try a different one.');
    }.bind(this));
}

/* Modals */

// Show and populate modal for editing an item
TeamStock.prototype.showItemModal = function(item) {
    if(!this.activeTeam) {
        toastr.error("Please create or select a planner first!");
        return;
    }
    
    if(!this.checkSignedIn()) {
        return;
    }
    this.setControlState(false);
    $(this.itemModal).slideDown(200);
    

    setTimeout(function() {
        var teamsRef = this.database.ref(this.prefix + 'teams');
        
//        if(item) {
//            console.log(item);
//            var taskRef = this.database.ref(this.prefix + 'teams/' + this.activeTeam.id + '/tasks/'+item.id);
//            
//            taskRef.once('value').then(function(snapshot) {
//                console.log('SET');
//                console.log(snapshot.val());
//                
//                this.itemModalName.value = snapshot.val()['name'];
//                this.itemModalCategory.value = snapshot.val()['category'];
//                this.itemModalDescription.value = snapshot.val()['description'];
//                this.itemModalDeadline.value = snapshot.val()['deadline'];
//                this.itemModalDuration.value = snapshot.val()['duration'];
//            }.bind(this));
//            
//        }
        
        this.itemModalDoneButton.addEventListener('click', function() {
            var item = {
                'name': this.itemModalName.value || '',
                'category': this.itemModalCategory.value.toUpperCase() || '',
                'description': this.itemModalDescription.value || '',
                'deadline': this.itemModalDeadline.value || '',
                'duration': this.itemModalDuration.value || ''
            };
            
            createEvent(item.name, item.description, item.deadline, item.deadline);
            
            this.dbSaveItem(item);
            this.hideItemModal.bind(this)();
            
            
        }.bind(this));
        
    }.bind(this),500);
}

// Hide and reset the item modal
TeamStock.prototype.hideItemModal = function() {
    
    this.itemModalName.value = '';
    this.itemModalCategory.value = '';
    this.itemModalDescription.value = '';
    this.itemModalDeadline.value = '';
    this.itemModalDuration.value = '';
    
    // Clear done button listeners to avoid repeat actions
    var doneButton = this.itemModalDoneButton;
    var newButton = doneButton.cloneNode(true);
    doneButton.parentNode.replaceChild(newButton, doneButton);
    this.itemModalDoneButton = newButton;
    
    $(this.itemModal).fadeOut(200);
    $('#item-modal-loading').slideDown();
    this.setControlState(true);
}

// Show and populate the settings modal
TeamStock.prototype.showSettingsModal = function() {
    if(!this.checkSignedIn()) {
        return;
    }
    this.setControlState(false);
    $(this.settingsModal).slideDown();
    $('#settings-modal-loading').slideDown();
    
    var userRef = this.database.ref(this.prefix + 'users/'+this.auth.currentUser.uid);
    
    userRef.once('value').then(function(snapshot) {
        if(!snapshot.val()) {
            this.hideSettingsModal();
            console.log(userRef.path);
            toastr.error('Error loading user data');
            return;
        }
        
        this.settingsModalUserTeam.value = snapshot.val()['team'] || '';
        
        console.log(snapshot.val());
        
        if(snapshot.val()['admin']) {
            
            this.settingsModalAdmin.removeAttribute('hidden');
            
            this.settingsModalDoneButton.addEventListener('click', function() {
                var userRef = this.database.ref(this.prefix + 'users/'+this.auth.currentUser.uid);

                userRef.update({
                    'team': this.settingsModalUserTeam.value || ''
                });
            }.bind(this));

            var settingsRef = this.database.ref(this.prefix + 'settings/');
            settingsRef.once('value').then(function(snapshot) {
                if(!snapshot.val()) {
                    return;
                }
                this.settingsModalWebhook.value = snapshot.val()['webhook'] || '';
                this.settingsModalChannel.value = snapshot.val()['channel'] || '';
                this.settingsModalSlackEnabled.checked = snapshot.val()['slackEnabled'];
                this.settingsModalSlackEnabled.setAttribute('checked', snapshot.val()['slackEnabled']);
                
            }.bind(this));
            
            this.settingsModalUsers.innerHTML = '';
            this.settingsModalTeams.innerHTML = '';
                        
            var teamsRef = this.database.ref(this.prefix + 'teams/');
            
            teamsRef.once('value').then(function(snapshot) {
                if(!snapshot.val()) {
                    return;
                }
                Object.keys(snapshot.val()).forEach( function(teamId) {
                    console.log(teamId);
                    this.settingsModalTeams.innerHTML += this.settingsModalTeamTemplate
                        .replace(/\$NAME/g, teamId);
                    setTimeout(function() {// Allows time to append html before trying to manipulate
                        var delButton = document.getElementById('team-'+teamId+'-del');
                        delButton.addEventListener('click', function() {
                            var confirm = window.prompt('All parts will be moved to storage. Enter team name ('+teamId+') to confirm deletion:');
                            if(confirm == teamId) {
                                var itemsRef =  this.database.ref(this.prefix + 'items/');
                                itemsRef.once('value', function(snapshot) {
                                    Object.keys(snapshot.val()).forEach(function (item) {
                                        var distribution = snapshot.val()[item].distribution;
                                        distribution['Storage'] = parseInt(distribution['Storage']) + parseInt(distribution[teamId] || '0');
                                        delete distribution[teamId];
                                        itemsRef.child(item).child('distribution').set(distribution);
                                    }.bind(this));
                                    this.hideSettingsModal();
                                }.bind(this));
                                teamsRef.child(teamId).remove();
                            } else {
                                toastr.error('Team not deleted (cancelled or names did not match)');
                            }
                        }.bind(this));
                    }.bind(this),100);
                }.bind(this));
                $('#settings-modal-loading').slideUp();
            }.bind(this));
            
            var usersRef = this.database.ref(this.prefix + 'users/');
            usersRef.once('value').then(function(snapshot) {
                if(!snapshot.val()) {
                    $('#settings-modal-loading').slideUp();
                    return;
                }
                Object.keys(snapshot.val()).forEach( function(uid) {
                    console.log(uid);
                    this.settingsModalUsers.innerHTML += this.modalUserTemplate
                        .replace(/\$NAME/g, snapshot.val()[uid].name)
                        .replace(/\$EMAIL/g, snapshot.val()[uid].email)
                        .replace(/\$ID/g, uid);
                    setTimeout(function() {// Allows time to append html before trying to manipulate
                        var toggle = document.getElementById('user-toggle-'+uid);
                        if (snapshot.val()[uid]['active']) {
                            toggle.checked = true;
                        }
                        console.log(toggle);
                        toggle.addEventListener('change', function(event) {
                            if(uid == this.auth.currentUser.uid) {
                                if(!window.confirm('Are you sure you want to change your own permissions? You may not be able to change them back')) {
                                    event.preventDefault();
                                    return;
                                }
                            }
                            
                            var toggle = document.getElementById('user-toggle-'+uid);

                            console.log(snapshot.val()[uid]['name']);
                            var userRef = this.database.ref(this.prefix + 'users/' + uid);
                            userRef.update({
                               'active': toggle.checked
                            }, function(error) {
                                if(error) {
                                    toastr.error('Unable to ' + 
                                           (toggle.checked ? 'grant access to ' : 'revoke access from ') +
                                            snapshot.val()[uid]['name'] +' - '+snapshot.val()[uid]['email']);
                                } else {
                                    toastr.success('Successfully ' + 
                                           (toggle.checked ? 'granted access to ' : 'revoked access from ') +
                                            snapshot.val()[uid]['name'] +' - '+snapshot.val()[uid]['email']);
                                    this.slack.bind(this)('_' +this.auth.currentUser.displayName.split(' ')[0] +
                                            (toggle.checked ? ' granted access to ' : ' revoked access from ') +
                                            snapshot.val()[uid]['name'] +' - '+snapshot.val()[uid]['email']);
                                }
                            }.bind(this));

                        }.bind(this));
                    }.bind(this),100);
                    setTimeout(function() {// Allows time to append html before trying to manipulate
                        var toggle = document.getElementById('admin-toggle-'+uid);
                        if (snapshot.val()[uid]['admin']) {
                            toggle.checked = true;
                        }
                        console.log(toggle);
                        toggle.addEventListener('change', function(event) {
                            if(uid == this.auth.currentUser.uid) {
                                if(!window.confirm('Are you sure you want to change your own permissions? You may not be able to change them back')) {
                                    event.preventDefault();
                                }
                            }
                            
                            var toggle = document.getElementById('admin-toggle-'+uid);

                            console.log(snapshot.val()[uid]['name']);
                            var userRef = this.database.ref(this.prefix + 'users/' + uid);
                            userRef.update({
                               'admin': toggle.checked
                            }, function(error) {
                                if(error) {
                                    toastr.error('Unable to ' + 
                                           (toggle.checked ? 'grant admin to ' : 'revoke admin from ') +
                                            snapshot.val()[uid]['name'] +' - '+snapshot.val()[uid]['email']);
                                } else {
                                    toastr.success('Successfully ' + 
                                           (toggle.checked ? 'granted admin to ' : 'revoked admin from ') +
                                            snapshot.val()[uid]['name'] +' - '+snapshot.val()[uid]['email']);
                                }
                            }.bind(this));

                        }.bind(this));
                    }.bind(this),100);
                }.bind(this));
                $('#settings-modal-loading').slideUp();
            }.bind(this));
            
            
            
            this.settingsModalDoneButton.addEventListener('click', function() {
                var userRef = this.database.ref(this.prefix + 'users/'+this.auth.currentUser.uid);
    
                userRef.update({
                    'team': this.settingsModalUserTeam.value || ''
                }, function(error) {
                    if(error) {
                        toastr.error('Error saving user settings.');
                    } else {
                        toastr.success('User settings saved successfully.')
                    }
                }.bind(this));

                var settingsRef = this.database.ref(this.prefix + 'settings');

                settingsRef.update({
                    'webhook': this.settingsModalWebhook.value || '',
                    'channel': this.settingsModalChannel.value || '',
                    'slackEnabled': this.settingsModalSlackEnabled.checked
                }, function(error) {
                    if(error) {
                        toastr.error('Error saving admin settings.');
                    } else {
                        toastr.success('Admin settings saved successfully.')
                    }
                }.bind(this));
                
                this.hideSettingsModal.bind(this)();
            }.bind(this));
        } else {
            $('#settings-modal-loading').slideUp();
        }
    }.bind(this));
}

// Hide the settings modal
TeamStock.prototype.hideSettingsModal = function() {
    // Clear done button listeners to avoid repeat actions
    var doneButton = this.settingsModalDoneButton;
    var newButton = doneButton.cloneNode(true);
    doneButton.parentNode.replaceChild(newButton, doneButton);
    this.settingsModalDoneButton = newButton;
    
    $(this.settingsModal).fadeOut(200);
    this.setControlState(true);
}


// ========== DB Functions: ========== //

// Load all items/categories from db and call corresponding UI functions to display them
TeamStock.prototype.dbLoadItems = function() {
    if(!this.activeTeam) {
        toastr.info("Please select or create a planner in the sidebar");
        $('#loading-main').stop().slideUp();
        return;
    }
    
    var itemsRef = this.database.ref(this.prefix + '/teams/' + this.activeTeam.id + '/tasks');
    var catRef = this.database.ref(this.prefix + '/teams/' + this.activeTeam.id + '/categories');
    
    this.doneLoading = false;
    
    catRef.once('value', function(snapshot) {
        console.log("SNAP");
        console.log(snapshot.val());
        this.clearList();
        
        if(snapshot.val()) {
            console.log(snapshot.val());
            Object.keys(snapshot.val()).forEach(function(category) {
                this.appendListCategory.bind(this)(category);
            }.bind(this));
        }
        
        // Only run this once to attatch listener
        if (this.doneLoading) {
            return;
        } else {
            this.doneLoading = true;
        }
        itemsRef.off('child_added');
        itemsRef.on('child_added', function(snapshot) {
            if(!snapshot.val()) {
                $('#loading-main').stop().slideUp();
                return;
            }
            $('#loading-main').stop().slideDown();

            var item = snapshot.val();
            this.appendListItem.bind(this)(snapshot.val());

            $('#loading-main').stop().slideUp();
        }.bind(this));
    }.bind(this));
    $('#loading-main').stop().slideUp();
}

// Checks database to determine whether the given category exists, and runs corresponding callback
TeamStock.prototype.dbCheckCategory = function(category, existsCallback, nexistsCallback) {
    this.database.ref(this.prefix + 'teams/' + this.activeTeam.id + '/categories/').once('value').then(function (snapshot) {
        if(category.length > 0 && category in snapshot.val()) {
            existsCallback();
        } else {
            nexistsCallback();
        }
    });
}

// Saves a new category to the database
TeamStock.prototype.dbSaveCategory = function(category) {
    var catRef = this.database.ref(this.prefix + 'teams/' + this.activeTeam.id + '/categories/'+category.name);
        console.log(this.activeTeam.id);
    
    this.doneLoading = false;
    
    // Check if category exists
    catRef.once('value').then(function (snapshot) {
        console.log(snapshot.val());
        if(snapshot.val() != null) {
            // Category already exists
            toastr.error('That category already exists!', 'Uh oh..');
        } else {
            // Category does not exist, add category
            console.log('Adding new category to database...');
            catRef.set(category.description).then(function () {
                // Allow reload:
                toastr.success('New category added successfully!');
                this.slack.bind(this)('*'+this.auth.currentUser.displayName.split(' ')[0] + '* _added new category *' + category.name + '*_');
                this.dbLoadItems.bind(this)();
            }.bind(this)).catch(function (error) {
                this.doneLoading = true;
                console.error('Error writing new category to Firebase Database', error);
                toastr.error('Error saving new category to database.', 'Uh oh...');
            }.bind(this));
        }
    }.bind(this));
}

// Saves a new item to the database
TeamStock.prototype.dbSaveItem = function(item) {
    
    var itemRef = this.database.ref(this.prefix + 'teams/'+this.activeTeam.id+"/tasks");
    
    // Check if item exists
    itemRef.once('value').then(function (snapshot) {
        if(snapshot.val() == null) {
            // Item already exists
            toastr.error('Couldn\'t find that class', 'Uh oh..');
        } else if(item.uid) {
            //TODO: Item exists, update
        } else {
            // Item does not exist, add item
            console.log('Adding new item to database...');
            
            this.dbCheckCategory(item.category, function() {
                itemRef.push({ 
                    name: item.name,
                    category: item.category,
                    description: item.description,
                    deadline: item.deadline,
                    duration: item.duration
                }).then(function () {
                    console.log('New task added successfully!');
                    toastr.success('New item added successfully!');
                    this.slack.bind(this)('*'+this.auth.currentUser.displayName.split(' ')[0] + '* _added new item *'+item.name+'* to category *' + item.category + '*_\nQty: _'+JSON.stringify(item.distribution)+'_');
                    this.dbLoadItems.bind(this)();
                }.bind(this)).catch(function (error) {
                    console.error('Error writing new item to Firebase Database', error);
                    toastr.error('Error saving new item to database.', 'Uh oh...');
                });
            }.bind(this), function() {
                toastr.error("No such class in this planner!", "Uh oh...");
            }.bind(this));
        }
    }.bind(this), function(error) {
        if(error) {
            toastr.error('Error creating item');
        }
    }.bind(this));
}

// Saves a new team to the database
TeamStock.prototype.dbSaveTeam = function(team) {
    var teamsRef = this.database.ref(this.prefix + 'teams/');
    team['users'] = {};
    team['users'][this.auth.currentUser.uid] = true;
        
    // Check if item exists
    teamsRef.once('value').then(function (snapshot) {
        // Team does not exist, add item
        console.log('Adding new team to database...');
        teamsRef.push(team).then(function () {
            toastr.success('New team added successfully!');
        }.bind(this)).catch(function (error) {
            console.error('Error writing new team to Firebase Database', error);
            toastr.error('Error saving new team to database.', 'Uh oh...');
        }.bind(this));
    }.bind(this));
}

// Slack Notifications //
//      POST Request format derrived from accepted answer at
//      http://stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
TeamStock.prototype.slack = function(message) {
    var settingsRef = this.database.ref(this.prefix + 'settings');
    
    try {    
        settingsRef.once('value').then(function(snapshot) {
            if(!snapshot.val()) {
                console.log("No webhook, slack notification not sent.");
                return;
            }
            var url = snapshot.val()['webhook'] || '';
            if(!url || !snapshot.val()['slackEnabled']) {
                console.log("No webhook or slack disabled, slack notification not sent.");
                return;
            }
            var payload = {
                'text':message,
                'username': '[team-stock] ' + this.auth.currentUser.displayName, 
                'icon_emoji': ':wrench:'
            };
            if(snapshot.val()['channel']) {
                payload['channel'] = snapshot.val()['channel'];
            }
            var params = 'payload='+JSON.stringify(payload);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            //Send the proper header information along with the request
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(params);
        }.bind(this));
    } catch(error) {
        console.log("Error, slack notification not sent.");
    }
};

// ========== Auth Funipnctions: ========== //

// Signs-in to TeamStock using Google auth popup
TeamStock.prototype.signIn = function () {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithRedirect(provider);
};

// Signs-out of TeamStock
TeamStock.prototype.signOut = function () {
    // Sign out of Firebase.
    this.auth.signOut();
};

// Returns true if user is signed-in. Otherwise false and displays a message.
TeamStock.prototype.checkSignedIn = function () {
    // Return true if the user is signed in Firebase
    if (this.auth.currentUser) {
        return true;
    }
    return false;
};

// Save new user data to database
TeamStock.prototype.saveUserIfNew = function(user) {
    
    // If database isn't initialized, wait until it is
    if (!this.database) {
        TeamStock.prototype.saveUser.bind(this)(user);
        return;
    }
    
    // Get reference to user entry in database
    var userRef = this.database.ref(this.prefix + 'users/'+user.uid);
    
    // Check if user exists
    userRef.once('value').then(function (snapshot) {
        if(snapshot.val() != null) {
            // User already exists
            toastr.success('Welcome back, ' + user.displayName + '!')
            // Check if user has permission to access database
            // If not, show access denied toast
            if (!(snapshot.val().active)) {
                //toastr signed out setup
                toastr.options = {
                  'closeButton': false,
                  'debug': false,
                  'newestOnTop': false,
                  'progressBar': false,
                  'positionClass': 'toast-bottom-center',
                  'preventDuplicates': false,
                  'onclick': null,
                  'showDuration': '-1',
                  'hideDuration': '-1',
                  'timeOut': '-1',
                  'extendedTimeOut': '-1',
                  'showEasing': 'swing',
                  'hideEasing': 'linear',
                  'showMethod': 'fadeIn',
                  'hideMethod': 'fadeOut'
                }
                toastr.error('You do not have permission to access the database.', 'Uh oh..');
            } else {
                this.setActiveTeam.bind(this)(null);
            }
        } else {
            // User does not exist, add user
            console.log('Adding new user to database...');
            userRef.set({ // Note: New user can not write to 'active' property, so it must be omitted until an admin activates the user.
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                pic: user.photoURL
            }).then(function () {
                console.log('New user added successfully!');
                toastr.success('Welcome, ' + user.displayName + '!');
                this.slack.bind(this)('_New user *'+user.displayName+' - '+user.email+'* has logged in for the first time._\n' +
                                     '_An admin must log in to enable this account._');
            }.bind(this)).catch(function (error) {
                console.error('Error writing new user to Firebase Database', error);
                toastr.error('Error saving new user to database. You may need to sign out and sign back in.', 'Uh oh...');
            });
        }
    }.bind(this));
}

// Triggers when the auth state changes, for instance when the user signs in or out.
TeamStock.prototype.onAuthStateChanged = function (user) {
    if (user) { // User is signed in!
        // Get profile pic and user's name from the Firebase user object.
        this.saveUserIfNew.bind(this)(user);
        var profilePicUrl = user.photoURL;
        var userName = user.displayName;

        // Set the user's profile pic and name.
        this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
        this.userName.textContent = userName;

        // Show user's profile and sign-out button.
        this.userName.removeAttribute('hidden');
        this.userPic.removeAttribute('hidden');
        this.signOutButton.removeAttribute('hidden');

        // Hide sign-in button and prompts.
        this.signInButton.setAttribute('hidden', 'true');
        this.sidebarSigninPrompt.setAttribute('hidden', true);
        this.setControlState(true);

        
            //toastr signed in setup
            toastr.options = {
              'closeButton': true,
              'debug': false,
              'newestOnTop': false,
              'progressBar': false,
              'positionClass': 'toast-bottom-center',
              'preventDuplicates': false,
              'onclick': null,
              'showDuration': '3000',
              'hideDuration': '3000',
              'timeOut': '3000',
              'extendedTimeOut': '3000',
              'showEasing': 'swing',
              'hideEasing': 'linear',
              'showMethod': 'fadeIn',
              'hideMethod': 'fadeOut'
            }
        toastr.clear();
        
//        this.dbLoadItems.bind(this)();
        this.loadSidebarContents.bind(this)();
        
    } else { // User is signed out!
        this.clearList.bind(this)();
        // Hide user's profile and sign-out button.
        this.userName.setAttribute('hidden', 'true');
        this.userPic.setAttribute('hidden', 'true');
        this.signOutButton.setAttribute('hidden', 'true');

        // Show sign-in button and prompts.
        this.signInButton.removeAttribute('hidden');
        this.sidebarSigninPrompt.removeAttribute('hidden');
        this.setControlState(false);

        //toastr signed out setup
        toastr.options = {
          'closeButton': false,
          'debug': false,
          'newestOnTop': false,
          'progressBar': false,
          'positionClass': 'toast-bottom-center',
          'preventDuplicates': false,
          'onclick': null,
          'showDuration': '-1',
          'hideDuration': '-1',
          'timeOut': '-1',
          'extendedTimeOut': '-1',
          'showEasing': 'swing',
          'hideEasing': 'linear',
          'showMethod': 'fadeIn',
          'hideMethod': 'fadeOut'
        }
        
        this.itemList.innerHTML = ' \
        <h3> \
            <i class=material-icons>keyboard_arrow_left</i> \
                Open Sidebar to sign in \
        </h3>';
        
        toastr.error('You must sign in');
        $('#loading-main').slideUp();
    }
};


//PASTED A TON OF G CAL STUFF
        var duration = 1;
        var name = "english paper test"
        var hwstart=0;
        var hwend=0;
      // Client ID and API key from the Developer Console
      var CLIENT_ID = '238684994941-im1iqgc6m44hr2k30rfcfit9kh774g7e.apps.googleusercontent.com';

      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = "https://www.googleapis.com/auth/calendar";

      var authorizeButton = document.getElementById('authorize-button');
      var signoutButton = document.getElementById('signout-button');

      /**
       *  On load, called to load the auth2 library and API client library.
       */
      function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      }

      /**
       *  Initializes the API client library and sets up sign-in state
       *  listeners.
       */
      function initClient() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }
        
        //WORK WORK WORK
        

      /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
      function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
          authorizeButton.style.display = 'none';
          signoutButton.style.display = 'block';
         
          listUpcomingEvents();
        } else {
          authorizeButton.style.display = 'block';
          signoutButton.style.display = 'none';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
                              

        gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        }).then(function(response) {
          var events = response.result.items;
          appendPre('Upcoming events:');

          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.id+event.summary + ' (' + when + ')')
              console.log(when);
            }
          } else {
            appendPre('No upcoming events found.');
          }
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                if (event.summary=='homework'){
                    hwstart = event.start.dateTime;
                    hwend = event.end.dateTime;
                    gapi.client.calendar.events.list({
                        'calendarId':'primary',
                        'timeMin': '2017-04-22T17:00:00-04:00',
                        'timeMax': '2017-04-22T18:00:00-04:00',
                          'showDeleted': false,
                          'singleEvents': true,
                          'maxResults': 10,
                          'orderBy': 'startTime'
                    }).then(function(response){
                            var events1 = response.result.items;
                        for (i = 0; i < events1.length; i++) {
              var event = events1[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.id+event.summary + ' (' + when + ')')
              console.log(when);
            }
                            });
                
              appendPre(hwstart+" "+hwend);
                    

     
          } else {
            appendPre('homework slots not found.');
          }
            }
          }
            
        });
      }
        
    function createEvent(name,description,duration){
        var st;
        var et;
        gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
        }).then(function(response) {
          var events = response.result.items;
          appendPre('Upcoming events:');

          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.id+event.summary + ' (' + when + ')')
              console.log(when);
                if (event.summary=='homework'){
                    hwstart = event.start.dateTime;
                    hwend = event.end.dateTime;
                }
            }
          } else {
            appendPre('No upcoming events found.');
          }
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                if (event.summary=='homework'){
                    hwstart = event.start.dateTime;
                    hwend = event.end.dateTime;
                    gapi.client.calendar.events.list({
                        'calendarId':'primary',
                        'timeMin': '2017-04-22T17:00:00-04:00',
                        'timeMax': '2017-04-22T18:00:00-04:00',
                          'showDeleted': false,
                          'singleEvents': true,
                          'maxResults': 10,
                          'orderBy': 'startTime'
                    }).then(function(response){
                            var events1 = response.result.items;
                        for (i = 0; i < events1.length; i++) {
              var event = events1[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.id+event.summary + ' (' + when + ')')
              console.log(when);
            }
                            });
                
              appendPre(hwstart+" "+hwend);
                    

     
          } else {
            appendPre('homework slots not found.');
          }
            }
          }
            
        });        
        
        var ev = {
            'summary': name,
            'description': description,
            'start': {
            'dateTime': st,
            'timeZone': 'America/New_York'
            },
            'end': {
            'dateTime': et,
            'timeZone': 'America/New_York'
            }
        };

        var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': ev
        });

        request.execute(function(ev) {
        toastr.success('Event created: ' + ev.htmlLink);
        });
    }


// ========Startup======== //
window.onload = function () {
    // UNCOMMENT THIS LINE TO RUN MANUAL TESTS
    /* This allows the TeamStock instance to be accessed from the console to manually run functions */
    window.teamStock = 
    //----
    new TeamStock();
};

// ========Utility======== //

/*
 * Gets root domain from web url
 * 
 * Source:
  * http://stackoverflow.com/questions/1034621/get-current-url-in-web-browser 
 */
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf('://') > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}
