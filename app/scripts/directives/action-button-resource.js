'use strict';

(function() {

  angular.module('ncsaas')
    .service('actionUtilsService', ['ncUtilsFlash', 'resourcesService', actionUtilsService]);

  function actionUtilsService(ncUtilsFlash, resourcesService) {
      this.applyAction = function(controller, resource, name, action) {
        var vm = this;
        var promise = (action.method == 'DELETE') ?
          resourcesService.$deleteByUrl(action.url) :
          resourcesService.$create(action.url).$save();

        promise.then(function(response) {
          vm.handleActionSuccess(action);
          if (name == "unlink" || name == "destroy") {
            controller.afterInstanceRemove(resource);
          } else {
            controller.reInitResource(resource);
          }
        },
        controller.handleActionException.bind(controller);
      );

      this.handleActionSuccess = function(action) {
        var template = "Request to {action} has been accepted";
        var message = template.replace("{action}", action.title);
        ncUtilsFlash.success(message);
      };
    }
  }

  angular.module('ncsaas')
    .directive('actionButtonResource', [
      '$rootScope', 'resourcesService', 'ngDialog', 'actionUtilsService',
      actionButtonResource]);

  function actionButtonResource($rootScope, resourcesService, ngDialog, actionUtilsService) {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/action-button-resource.html',
      replace: true,
      scope: {
        buttonController: '=',
        buttonModel: '='
      },
      link: function (scope) {
        scope.errors = {};
        scope.actions = null;
        scope.loading = false;

        scope.buttonClick = buttonClick;
        scope.openActionsListTrigger = openActionsListTrigger;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;

        function buttonClick(name, action) {
          function applyAction() {
            actionUtilsService.applyAction(scope.buttonController, scope.buttonModel, name, action);
          }
          if (action.type === 'button') {
            if (action.destructive) {
              if (confirm('Are you sure? This action cannot be undone.')) {
                applyAction();
              }
            } else {
              applyAction();
            }
          } else if (action.type === 'form') {
            openActionDialog(action);
          }
        }

        function openActionDialog(action) {
          var dialogScope = $rootScope.$new();
          dialogScope.action = action;
          ngDialog.open({
            templateUrl: 'views/directives/action-dialog.html',
            className: 'ngdialog-theme-default',
            scope: dialogScope
          });
        }

        function openActionsListTrigger() {
          loadActions();
          if (!controller.actionButtonsList[scope.$id]) {
            scope.$broadcast('actionButton:close');
          }
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
        }

        function loadActions() {
          scope.loading = true;
          resourcesService.getOption(scope.buttonModel.url).then(function(response) {
            if (response.actions) {
              scope.actions = response.actions;
            }
          }).finally(function() {
            scope.loading = false;
          });
        }

        function closeAll() {
          for (var i = 0; controller.actionButtonsList.length > i; i++) {
            controller.actionButtonsList[i] = false;
          }
        }

        scope.$on('actionButton:close', closeAll);
        $rootScope.$on('clicked-out', closeAll);
      }
    };
  }

  angular.module('ncsaas').controller('ActionDialogController', 
    ['$scope', 'resourcesService', 'actionUtilsService', ActionDialogController]);

  function ActionDialogController($scope, resourcesService, actionUtilsService) {
    angular.extend($scope, {
      init: function () {
        $scope.errors = {};
        $scope.form = resourcesService.$create($scope.action.url);
        $scope.getSelectList();
      },
      getSelectList: function () {
        var fields = $scope.action.fields;
        angular.forEach(fields, function(field) {
          if (field.url) {
            resourcesService.getList({}, field.url).then(function(response) {
              field.list = response;
            });
          }
        });
      },
      submitForm: function () {
        var fields = $scope.action.fields;
        for (var field in fields) {
          if (fields[field].required && !$scope.form[field]) {
            $scope.errors[field] = ['This field is required'];
            return;
          }
        }
        return $scope.form.$save(function(response) {
          $scope.errors = {};
          actionUtilsService.handleActionSuccess($scope.action);
          $scope.closeThisDialog();
        }, function(response) {
          $scope.errors = response.data;
        });
      },
      cancel: function() {
        $scope.closeThisDialog();
      }
    });
    $scope.init();
  }

})();
