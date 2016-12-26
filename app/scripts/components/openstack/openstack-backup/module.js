import openstackBackupsService from '../openstack-backup/openstack-backups-service';
import openstackBackupsList from '../openstack-backup/openstack-backups-list';

export default module => {
  module.service('openstackBackupsService', openstackBackupsService);
  module.directive('openstackBackupsList', openstackBackupsList);
  module.config(actionConfig);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Backup', {
    order: [
      'edit'
    ],
    options: {
      edit: {
        title: 'Edit',
        enabled: true,
        type: 'form',
        method: 'PUT',
        fields: {
          name: {
            label: 'Name',
            max_length: 150,
            required: true,
            type: 'string'
          },
          description: {
            label: 'Description',
            max_length: 500,
            required: false,
            type: 'string'
          },
          kept_until: {
            help_text: 'Guaranteed time of backup retention. If null - keep forever.',
            label: 'Kept until',
            required: false,
            type: 'datetime'
          }
        }
      }
    }
  });
}
