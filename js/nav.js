// navigation
window.navigation = window.navigation || {},
function(n, dest) {
 navigation.menu = {
   constants: {
     sectionTemplate: '.section-template',
     contentContainer: '#wrapper',
     startSectionMenuItem: '#landing-menu',
     startSection: '#landing'
   },

   importSectionsToDOM: function() {
     const links = document.querySelectorAll('link[rel="import"]')
     Array.prototype.forEach.call(links, function (link) {
       let template = link.import.querySelector(navigation.menu.constants.sectionTemplate)
       let clone = document.importNode(template.content, true)
       document.querySelector(navigation.menu.constants.contentContainer).appendChild(clone)
     })
   },

   setMenuOnClickEvent: function () {
     document.body.addEventListener('click', function (event) {
       if (event.target.dataset.section) {
         navigation.menu.hideAllSections()
         navigation.menu.showSection(event)
       }
     })
     document.body.addEventListener('redirect', function (event) {
       navigation.menu.hideAllSections()
       let section = event.detail
       $('#' + section).show()
       $('#' + section + ' section').show()
     })
   },

   showSection: function(event) {
     const sectionId = event.target.dataset.section
     if (sectionId === 'projects') {
       populateProjectsScreen();
     }
     if (sectionId !== 'detail') {
       $('#slidebutton').addClass('hidden');
     }
     if (sectionId === 'settings') {
       clearSettings();
       loadSettings();
     }
     if (sectionId === 'landing') {
       populate_landing();
     }
     checkSlideDrawer();
     $('#' + sectionId).show();
     $('#' + sectionId + ' section').show();
   },

   showStartSection: function() {
     $(this.constants.startSectionMenuItem).click()
     $(this.constants.startSection).show()
     $(this.constants.startSection + ' section').show()
   },

   hideAllSections: function() {
     $(this.constants.contentContainer + ' section').hide()
   },

   init: function() {
     this.importSectionsToDOM()
     this.setMenuOnClickEvent()
     this.hideAllSections()
     this.showStartSection()
   }
 };

 n(function() {
   navigation.menu.init()
 })

}(jQuery);

function redirect(destination) {
  if (destination == "projects") {
    populateProjectsScreen();
  }
  var event = new CustomEvent('redirect', { detail: destination });
  document.body.dispatchEvent(event);
}
