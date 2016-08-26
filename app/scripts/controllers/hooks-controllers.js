'use strict';

(function() {
  angular.module('ncsaas')
    .controller('HookListController', [
      'baseControllerListClass',
      '$filter',
      '$uibModal',
      '$rootScope',
      'hooksService',
      'eventRegistry',
      'ENTITYLISTFIELDTYPES',
      HookListController
    ]);

  function HookListController(
    baseControllerListClass,
    $filter,
    $uibModal,
    $rootScope,
    hooksService,
    eventRegistry,
    ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this.blockUIElement = 'tab-content';
        this._super();

        this.actionButtonsListItems = [
          {
            title: 'Remove',
            icon: 'fa-trash',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          }
        ];

        this.entityOptions = {
          entityData: {
            noDataText: 'No notifications registered',
            createLinkAction: this.openDialog.bind(this),
            createLinkText: 'Add notification',
            rowTemplateUrl: 'views/user/hook-row.html'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'is_active',
              onlineStatus: true,
              className: 'statusCircle'
            },
            {
              type: ENTITYLISTFIELDTYPES.name,
              propertyName: 'label',
              name: 'Method',
              action: this.openDialog.bind(this)
            },
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'destination',
              name: 'Destination'
            },
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'events',
              name: 'Events'
            }
          ]
        };
      },

      openDialog: function(hook) {
        var scope = $rootScope.$new();
        scope.hook = hook;
        $uibModal.open({
          templateUrl: 'views/profile/hook-dialog.html',
          controller: 'HookDialogController',
          controllerAs: 'HookController',
          bindToController: true,
          scope: scope
        }).result.then(function() {
          this.service.clearAllCacheForCurrentEndpoint();
          this.getList();
        }.bind(this));
      },

      removeInstance: function(hook) {
        return this.service.$deleteByUrl(hook.url);
      },

      search: function() {
        var vm = this,
          searchInput = vm.searchInput.toLowerCase();

        vm.list = vm.service.list.filter(function(item) {
          if (
            item.label.toLowerCase().indexOf(searchInput) >= 0
            || item.destination.toLowerCase().indexOf(searchInput) >= 0
          ) {
            return item;
          }
        });
      },

      afterGetList: function() {
        this.list.forEach(function(item) {
          item.label = $filter('titleCase')(item.hook_type);
          item.destination = item.destination_url || item.email;
          item.events = item.event_groups.map($filter('formatEventTitle')).join(', ');
        });
        this.service.list = this.list;
      }
    });
    Object.setPrototypeOf(controllerScope, new Controller());
  }
})();

(function() {
  angular.module('ncsaas').filter('formatEventTitle', ['$filter', formatEventTitle]);
  function formatEventTitle($filter) {
    return function(choice) {
      var map = {
        ssh: 'SSH',
        jira: 'JIRA',
        vms: 'Resources'
      };
      if (map[choice]) {
        choice = map[choice];
      } else {
        choice = $filter('titleCase')(choice.replace('_', ' '));
      }
      return choice + ' events';
    }
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('HookDialogController', [
      'hooksService', 'eventsService', 'ncUtilsFlash', '$filter',
      HookDialogController]);

  function HookDialogController(hooksService, eventsService, ncUtilsFlash, $filter) {
    var vm = this;
    vm.save = save;

    function init() {
      loadEventGroups();
      vm.types = hooksService.getTypes();
      if (vm.hook) {
        vm.instance = angular.copy(vm.hook);
      } else {
        vm.instance = {
          hook_type: 'webhook',
          event_groups: []
        };
      }
    }

    function loadEventGroups() {
      vm.loading = true;
      eventsService.getEventGroups().then(function(groups) {
        vm.choices = Object.keys(groups).sort().map(function(choice) {
          return {
            id: choice,
            title: $filter('formatEventTitle')(choice),
            selected: vm.instance.event_groups.indexOf(choice) !== -1
          }
        });
      }).finally(function() {
        vm.loading = false;
      });
    }

    function getSelected() {
      return vm.choices.filter(function(choice) {
        return choice.selected
      }).map(function(choice) {
        return choice.id;
      });
    }

    function save() {
      var promise, message;
      vm.instance.event_groups = getSelected();
      if (vm.instance.uuid) {
        promise = hooksService.update(vm.instance);
        message = 'Notification has been updated'
      } else {
        promise = hooksService.create(vm.instance);
        message = 'Notification has been created';
      }
      return promise.then(function() {
        ncUtilsFlash.success(message);
        vm.$close();
      }, function(response) {
        vm.errors = response.data;
      });
    }
    init();
  }
})();
