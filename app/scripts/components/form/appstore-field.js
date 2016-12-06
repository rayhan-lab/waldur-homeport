// @ngInject
export default function appstoreField($filter, $compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const field = $parse(attributes.field)(scope);
      const component = field.component && $filter('snakeCase')(field.component) || `appstore-field-${field.type}`;
      const template = `<${component} model="${attributes.model}" field="${attributes.field}"></${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  }
}