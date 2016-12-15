// @ngInject
export default function ProjectDetailsController(
  $scope, currentStateService, tabCounterService,
  eventsService, projectsService, $state, AppStoreUtilsService) {
  activate();

  function activate() {
    $scope.items = [
      {
        icon: "fa-th-large",
        label: "Dashboard",
        link: "project.details({uuid: $ctrl.context.project.uuid})",
      },
      {
        icon: "fa-shopping-cart",
        label: "Service store",
        feature: "appstore",
        action: function() {
          return AppStoreUtilsService.openDialog()
        },
        state: "appstore",
      },
      {
        label: "Resources",
        icon: "fa-files-o",
        link: "project.resources",
        children: [
          {
            link: "project.resources.vms({uuid: $ctrl.context.project.uuid})",
            icon: "fa-desktop",
            label: "Virtual machines",
            feature: "vms",
            countFieldKey: "vms"
          },
          {
            link: "project.resources.clouds({uuid: $ctrl.context.project.uuid})",
            icon: "fa-cloud",
            label: "Private clouds",
            feature: "private_clouds",
            countFieldKey: "private_clouds"
          },
          {
            link: "project.resources.apps({uuid: $ctrl.context.project.uuid})",
            icon: "fa-cube",
            label: "Applications",
            feature: "apps",
            countFieldKey: "apps"
          },
          {
            link: "project.resources.storage.tabs({uuid: $ctrl.context.project.uuid})",
            icon: "fa-hdd-o",
            label: "Storage",
            feature: "storage",
            countFieldKey: "storages"
          }
        ]
      },
      {
        link: "project.support({uuid: $ctrl.context.project.uuid})",
        icon: "fa-question-circle",
        label: "Support",
        feature: "premiumSupport",
        countFieldKey: "premium_support_contracts"
      },
      {
        link: "project.events({uuid: $ctrl.context.project.uuid})",
        icon: "fa-bell-o",
        label: "Audit logs",
        feature: "eventlog"
      },
      {
        link: "project.issues({uuid: $ctrl.context.project.uuid})",
        icon: "fa-question-circle",
        label: "Issues",
        feature: "support"
      },
      {
        link: "project.alerts({uuid: $ctrl.context.project.uuid})",
        icon: "fa-fire",
        label: "Alerts",
        feature: "alerts",
        countFieldKey: "alerts"
      },
      {
        label: 'Team',
        icon: 'fa-group',
        link: 'project.team({uuid: $ctrl.context.project.uuid})',
        feature: 'team',
        countFieldKey: 'users'
      },
      {
        link: "project.delete({uuid: $ctrl.context.project.uuid})",
        icon: "fa-wrench",
        label: "Manage"
      }
    ];
    $scope.$on('currentProjectUpdated', function() {
      refreshProject();
    });
    $scope.$on('authService:signin', function() {
      refreshProject();
    });
    refreshProject();
  }

  function refreshProject() {
    currentStateService.getProject().then(function(project) {
      $scope.currentProject = project;
      $scope.context = {project: project};
      connectCounters(project);
    });
  }

  function connectCounters(project) {
    if ($scope.timer) {
      tabCounterService.cancel($scope.timer);
    }

    $scope.timer = tabCounterService.connect({
      $scope: $scope,
      tabs: $scope.items,
      getCounters: getCounters.bind(null, project),
      getCountersError: getCountersError
    });
  }

  function getCounters(project) {
    var query = angular.extend(
      {UUID: project.uuid},
      eventsService.defaultFilter
    );
    return projectsService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status == 404) {
      projectsService.getFirst().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      });
    } else {
      tabCounterService.cancel($scope.timer);
    }
  }
}