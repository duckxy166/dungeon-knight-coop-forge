(function () {
  'use strict';

  window.DK_BUNDLES = window.DK_BUNDLES || Object.create(null);
  window.DK_BUNDLES.en = {
    locale: 'en',
    label: 'English',
    text: Object.create(null),
    descriptions: Object.create(null),
    describeWeapon: function (weapon) {
      return weapon && (weapon._bundleOriginalDesc || weapon.desc) || '';
    }
  };
})();
