/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
 

/**
 * Controls the appearance and behavior of the dimension list
 * 
 * This is where drag and drop lives
 */
var DimensionList = Backbone.View.extend({
    events: {
        'click span': 'select',
        'click a': 'select',
        'click .parent_dimension ul li a.level' : 'select_dimension',
        'click .measure' : 'select_measure'
    },
    
    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "render", "load_dimension","select_dimension");
        
        // Bind parent element
        this.workspace = args.workspace;
        this.dimension = args.dimension;
        this.type = args.type;
        
        // Fetch from the server if we haven't already
        if (args.dimension && args.dimension.has('template_' + args.type)) {
            this.load_dimension();
        } else if (! args.dimension){
            $(this.el).html('Could not load dimension. Please log out and log in again.');
        } else {
            $(this.el).html('Loading...');
            this.workspace.bind('cube:loaded',  this.load_dimension);
        }
    },
    
    load_dimension: function() {
        this.template = this.dimension.get('template_' + this.type);
        this.render(); 
        this.workspace.trigger('dimensions:loaded', $(this.el));

    },
    
    render: function() {
        // Pull the HTML from cache and hide all dimensions
        var self = this;
        $(this.el).hide().html(this.template);
        if (isIE && isIE <= 8) {
            $(this.el).show();
        } else {
            $(this.el).fadeTo(500,1);
        }
        
        // Add draggable behavior
        $(this.el).find('.measure,.level').parent('li').mousedown(function(event, ui) {
            event.preventDefault();
            if ($(event.target).parent().hasClass('ui-state-disabled')) {
                return;
            }
            if (self.workspace.query.get('type') == "QM") {
                if ( $(self.workspace.toolbar.el).find('.toggle_fields').hasClass('on') && $(self.workspace.el).find('.workspace_editor').is(':hidden')) {
                    self.workspace.toolbar.toggle_fields();
                }
            }
        });

        $(this.el).find('.measure').parent('li').draggable({
            cancel: '.not-draggable',
            connectToSortable: $(this.workspace.el).find('.fields_list_body.details ul.connectable'),
            helper: 'clone',
            placeholder: 'placeholder',
            opacity: 0.60,
            tolerance: 'touch',
            stop: function() {
                if (self.workspace.query.get('type') == "QM") {
                    if ( $(self.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
                        self.workspace.toolbar.toggle_fields();
                    }
                }
            },
            cursorAt: { top: 10, left: 35 }
        });        

        $(this.el).find('.level').parent('li').draggable({
            cancel: '.not-draggable, .hierarchy',
            connectToSortable: $(this.workspace.el).find('.fields_list_body.columns > ul.connectable, .fields_list_body.rows > ul.connectable, .fields_list_body.filter > ul.connectable'),
            //helper: "clone",
            helper: function(event, ui){
                var target = $(event.target).hasClass('d_level') ? $(event.target) : $(event.target).parent();
                var hierarchy = target.find('a').attr('hierarchy');
                var level = target.find('a').attr('level');
                var h = target.parent().clone().removeClass('d_hierarchy').addClass('hierarchy');
                h.find('li a[hierarchy="' + hierarchy + '"]').parent().hide();
                h.find('li a[level="' + level + '"]').parent().show();
                var selection = $('<li class="selection"></li>');
                selection.append(h);
                return selection;

            },

            placeholder: 'placeholder',
            opacity: 0.60,
            tolerance: 'touch',
            stop: function() {
                if (self.workspace.query.get('type') == "QM") {
                    if ( $(self.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
                        self.workspace.toolbar.toggle_fields();
                    }
                }
            },
            cursorAt: {
                top: 10,
                left: 35
            }
        });
    },
    
    select: function(event) {
        var $target = $(event.target).hasClass('root')
            ? $(event.target) : $(event.target).parent().find('span');
        if ($target.hasClass('root')) {
            $target.find('a').toggleClass('folder_collapsed').toggleClass('folder_expand');
            $target.toggleClass('collapsed').toggleClass('expand');
            $target.parents('li').find('ul').children('li').toggle();
        }
        
        return false;
    },

     select_dimension: function(event, ui) {
        if (this.workspace.query.model.type != "QUERYMODEL") {
            return;
        }
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        

        var hierarchy = $(event.target).attr('hierarchy');
        var hierarchyCaption = $(event.target).parent().parent().attr('hierarchycaption');
        var level = $(event.target).attr('level');

        if ($(this.workspace.el).find(".workspace_fields ul.hierarchy[hierarchy='" + hierarchy + "']").length > 0) {
            var $level = $(this.workspace.el).find(".workspace_fields ul[hierarchy='" + hierarchy + "'] a[level='" + level + "']").parent().show();
            var axisName = $level.parents('.fields_list_body').hasClass('rows') ? "ROWS" : "COLUMNS";

            this.workspace.query.helper.includeLevel(axisName, hierarchy, level);

        } else {
            var $axis = $(this.workspace.el).find(".workspace_fields .fields_list[title='ROWS'] ul.hierarchy").length > 0 ?
                $(this.workspace.el).find(".workspace_fields .fields_list[title='COLUMNS'] ul.connectable") :
                $(this.workspace.el).find(".workspace_fields .fields_list[title='ROWS'] ul.connectable") ;

            var axisName = $axis.parents('.fields_list').attr('title');

            
                var hierarchy = $(event.target).parent().find('a').attr('hierarchy');
                var level = $(event.target).parent().find('a').attr('level');
                var h = $(event.target).parent().parent().clone().removeClass('d_hierarchy').addClass('hierarchy');
                h.find('li a[hierarchy="' + hierarchy + '"]').parent().hide();
                h.find('li a[level="' + level + '"]').parent().show();
                var selection = $('<li class="selection"></li>');
                selection.append(h);
                selection.appendTo($axis);

/*
            var levels = $(event.target).parent().parent().find('li a[hierarchy="' + hierarchy + '"]').parent().clone().hide();
            levels.find('a[level="' + level + '"]').parent().show();
            var dropHierarchy = $('<ul />').attr('hierarchy', hierarchy).attr('hierarchycaption', hierarchyCaption).addClass('hierarchy').append(levels);
            $( $('<li class="selection"></li>')).append(dropHierarchy).appendTo($axis);
*/
            this.workspace.query.helper.includeLevel(axisName, hierarchy, level);

        }

        $(event.target).parent().draggable('disable');

        this.workspace.drop_zones.update_dropzones();
        this.workspace.query.run();
        /*
        if ( $(this.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
            $(this.workspace.el).find('.workspace_editor').delay(2000).slideUp({ complete: this.workspace.adjust });
        }
        */
        event.preventDefault();
        return false;
    },

    select_measure: function(event, ui) {
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            return;
        }
        

        var $axis = $(this.workspace.el).find(".workspace_fields .fields_list_body.details ul.connectable");
        var $target = $(event.target).parent().clone();
        if ($axis.find(".d_measure").length != 0)
            $target.insertAfter($axis.find(".d_measure:last"));
        else {
            $target.appendTo($axis);
        }

        $(event.target).parent().draggable('disable');

        var measure = {
            "name": $target.find('a').attr('measure'),
            "type": $target.find('a').attr('type')
        };
        if (measure) {

            this.workspace.query.helper.includeMeasure(measure);
            this.workspace.query.run();
        }
        this.workspace.drop_zones.update_dropzones();
        
/*
        if ( $(this.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
            $(this.workspace.el).find('.workspace_editor').delay(2000).slideUp({ complete: this.workspace.adjust });
        }
*/        
        event.preventDefault();
        return false;
    }
});
