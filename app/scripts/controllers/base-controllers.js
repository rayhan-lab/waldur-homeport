'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', [
      '$rootScope', '$scope', '$state', 'currentStateService', 'customersService',
      'usersService', 'ENV', 'baseControllerClass', '$translate', 'LANGUAGE', '$window', 'projectsService',
      HeaderController]);

  function HeaderController(
    $rootScope, $scope, $state, currentStateService, customersService, usersService,
    ENV, baseControllerClass, $translate, LANGUAGE, $window, projectsService) {
    var controllerScope = this;
    var HeaderControllerClass = baseControllerClass.extend({
      customers: [],
      currentUser: {},
      currentCustomer: {},
      projects: [],
      currentProject: {},
      showImport: ENV.showImport,
      menuState: {
        addSomethingMenu: false,
        customerMenu: false,
        profileMenu: false,
        LangMenu: false
      },

      init: function() {
        this.activate();
        this.menuItemActive = currentStateService.getActiveItem($state.current.name);
      },
      activate: function() {
        var vm = this;
        // XXX: for top menu customers viewing
        customersService.pageSize = ENV.topMenuCustomersCount;
        customersService.cacheTime = ENV.topMenuCustomersCacheTime;
        customersService.getList().then(function(response) {
          vm.customers = response;
        });
        // reset pageSize
        customersService.pageSize = ENV.pageSize;

        projectsService.getList().then(function(response) {
          vm.projects = response;
        });
        // initiate current user
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });

        // initiate current customer
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        });

        currentStateService.getProject().then(function(project) {
          vm.currentProject = project;
        });

        $rootScope.closeMenu = vm.closeMenu;

        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.currentLanguage = this.findLanguageByCode($translate.use());
      },

      changeLanguage: function(language) {
        this.currentLanguage = language;
        $translate.use(this.currentLanguage.code);
      },

      findLanguageByCode: function(code) {
        for (var i=0; i<LANGUAGE.CHOICES.length; i++) {
          if (LANGUAGE.CHOICES[i].code == code) {
            return LANGUAGE.CHOICES[i];
          }
        }
      },

      closeMenu: function() {
        var vm = controllerScope;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            vm.menuState[property] = false;
          }
        }
        $rootScope.$broadcast('clicked-out');
      },
      setCurrentCustomer: function(customer) {
        var vm = this;
        $window.localStorage[ENV.currentCustomerUuidStorageKey] = customer.uuid;
        currentStateService.setCustomer(customer);
        vm.currentCustomer = customer;
        $rootScope.$broadcast('currentCustomerUpdated');
      },
      setCurrentProject: function(project) {
        var vm = this;
        $window.localStorage[ENV.currentProjectUuidStorageKey] = project.uuid;
        currentStateService.setProject(project);
        vm.currentProject = project;
        $rootScope.$broadcast('currentProjectUpdated');
      },
      menuToggle: function(active, event) {
        var vm = this;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            if (property !== active) {
              vm.menuState[property] = false;
            }
          }
        }
        event.stopPropagation();
        vm.menuState[active] = !vm.menuState[active];
      },
      mobileMenu: function() {
        this.showMobileMenu = !this.showMobileMenu;
      }
    });

    controllerScope.__proto__ = new HeaderControllerClass();
  }

  angular.module('ncsaas')
    .controller('MainController', [
      '$q', '$rootScope', '$state', 'authService', 'currentStateService', 'customersService', 'usersService',
      'baseControllerClass', '$window', 'ENV', 'projectsService', MainController]);

  function MainController(
    $q, $rootScope, $state, authService, currentStateService, customersService, usersService, baseControllerClass,
    $window, ENV, projectsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({

      init: function() {
        this.setSignalHandler('$stateChangeSuccess', this.stateChangeSuccessHandler.bind(controllerScope));
        this._super();
        $rootScope.logout = this.logout;
      },
      logout: function() {
        authService.signout();
        currentStateService.isCustomerDefined = false;
        $state.go('home.login');
      },
      stateChangeSuccessHandler: function(event, toState) {
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var deferred = $q.defer(),
            projectDeferred = $q.defer();
          usersService.getCurrentUser().then(function(user) {
            if($window.localStorage[ENV.currentCustomerUuidStorageKey]) {
              customersService.$get($window.localStorage[ENV.currentCustomerUuidStorageKey]).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              });
            } else {
              customersService.getPersonalOrFirstCustomer(user.username).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              });
            }
          });
          currentStateService.setCustomer(deferred.promise);
          currentStateService.setProject(projectDeferred.promise);
        }

        function getProject() {
          if ($window.localStorage[ENV.currentProjectUuidStorageKey]) {
            projectsService.$get($window.localStorage[ENV.currentProjectUuidStorageKey]).then(function(response) {
              projectDeferred.resolve(response);
            });
          } else {
            projectsService.getFirst().then(function(response) {
              projectDeferred.resolve(response);
            });
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

