/*
 *   Copyright 2015 OSBI Ltd
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
 * Dialog for date filter
 */
var DateFilterModal = Modal.extend({
	type: 'date-filter',

	buttons: [
		{ text: 'Save', method: 'save' },
		{ text: 'Cancel', method: 'finished' }
	],

	events: {
		'click a': 'call',
		'focus .selection-date'  : 'selection_date',
		'click .selection-radio' : 'disable_divselections',
		'click .operator-radio'  : 'show_fields',
		'click #add-date'        : 'add_selected_date',
		'click .del-date'        : 'del_selected_date'
	},

	template_days_mdx: 'Filter({parent}.Members, {parent}.CurrentMember.NAME {comparisonOperator} \'{dates}\'',

	template_many_years_mdx: ' {logicalOperator} {parent}.CurrentMember.NAME {comparisonOperator} \'{dates}\'',

	template_mdx: '{parent} CurrentDateMember([{dimension}.{hierarchy}], \'["{dimension}.{hierarchy}"]\\\.{AnalyzerDateFormat}\', EXACT)',

	template_last_mdx: '{parent} LastPeriods({periodamount}, CurrentDateMember([{dimension}.{hierarchy}], \'["{dimension}.{hierarchy}"]\\\.{AnalyzerDateFormat}\', EXACT))',

	template_dialog: _.template(
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-operator" level-type="TIME_DAYS" disabled>' +
			'</div>' +
			'<div class="available-selections" selection-name="operator" available="false">' +
				'<span class="i18n">Operator:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-equals" value="="> Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-after" value=">"> After</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-before" value="<"> Before</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-between" value=">|<"> Between</label><br>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-different" value="<>"> Different</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-after-equals" value=">="> After&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-before-equals" value="<="> Before&Equals</label>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<label><input type="radio" name="operator-radio" class="operator-radio" id="op-notbetween"> Not Between</label><br>' +
					'</div>' +
					'<div class="inline-form-group">' +
						'<div class="form-group" id="div-selection-date" hidden>' +
							'<label>Select a date:</label>' +
							'<input type="text" class="selection-date" id="selection-date" placeholder="Choose a date">' +
							'<a class="form_button" id="add-date">add</a>' +
						'</div>' +
						'<div class="form-group" id="div-selected-date" hidden>' +
							'<fieldset>' +
								'<legend>Selected date:</legend>' +
								'<ul id="selected-date"></ul>' +
							'</fieldset>' +
						'</div>' +
					'</div>' +
					'<div class="form-group" id="div-select-start-date" hidden>' +
						'<label>Select a start date:</label>' +
						'<input type="text" class="selection-date" id="start-date" placeholder="Choose a date">' +
					'</div>' +
					'<div class="form-group" id="div-select-end-date" hidden>' +
						'<label>Select an end date:</label>' +
						'<input type="text" class="selection-date" id="end-date" placeholder="Choose a date">' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-fixed-date">' +
			'</div>' +
			'<div class="available-selections" selection-name="fixed-date" available="false">' +
				'<span class="i18n">Fixed Date:</span><br>' +
				'<div class="selection-options">' +
					'<label><input type="radio" name="fixed-radio" id="fd-yesterday"> Yesterday</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-day"> Today</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-week"> Current Week</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-month"> Current Month</label>' +
					'<label><input type="radio" name="fixed-radio" id="fd-quarter"> Current Quarter</label><br>' +
					'<label><input type="radio" name="fixed-radio" id="fd-year"> Current Year</label>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="box-selections">' +
			'<div class="selection-option">' +
				'<input type="radio" class="selection-radio" name="selection-radio" id="selection-radio-available">' +
			'</div>' +
			'<div class="available-selections" selection-name="rolling-date" available="false">' +
				'<span class="i18n">Rolling Date:</span><br>' +
				'<div class="selection-options">' +
					'<div class="form-group-selection">' +
						'<select id="">' +
							'<option value="last">Last</option>' +
							'<option value="next" disabled class="keep-disabled">Next</option>' +
						'</select>' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<input type="text" id="date-input">' +
					'</div>' +
					'<div class="form-group-selection">' +
						'<select id="period-select">' +
							'<option>-- Select --</option>' +
							'<option name="TIME_DAYS" id="rd-days">Day(s)</option>' +
							'<option name="TIME_WEEKS" id="rd-weeks">Week(s)</option>' +
							'<option name="TIME_MONTHS" id="rd-months">Month(s)</option>' +
							'<option name="TIME_YEARS" id="rd-years">Year(s)</option>' +
						'</select>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>'
	),

	initialize: function(args) {
		// Initialize properties
		_.extend(this, args);
		this.options.title = 'Date Filter';
		this.message = 'Loading...';
		this.query = args.workspace.query;
		this.selections = [];
		this.dates = [];

		_.bindAll(this, 'finished');

		// Resize when rendered
		this.bind('open', this.post_render);
		this.render();

		this.$el.parent().find('.ui-dialog-titlebar-close').bind('click', this.finished);

		// Fetch available members
		this.member = new Member({}, {
			cube: this.workspace.selected_cube,
			dimension: this.key
		});

		// Load template
		this.$el.find('.dialog_body').html(this.template_dialog);

		this.$el.find('.available-selections *').prop('disabled', true).off('click');

		// Save data of levels
		this.dataLevels = this.save_data_levels();

		// Check SaikuDayFormatString in level
		this.check_saikuDayFormatString();

		// Initialize adding values
		this.add_values_fixed_date();
		this.add_values_last_periods();

		// Populate date filter
		this.populate();
	},

	post_render: function(args) {
		var left = ($(window).width() - 600) / 2,
			width = $(window).width() < 600 ? $(window).width() : 600;
		$(args.modal.el).parents('.ui-dialog')
			.css({ width: width, left: 'inherit', margin: '0', height: 490 })
			.offset({ left: left});
	},

	check_saikuDayFormatString: function() {
		var self = this;
		this.$el.find('.selection-radio').each(function(key, radio) {
			_.find(self.dataLevels, function(value) {
				if (self.name === value.name && value.saikuDayFormatString) {
					$(radio).prop('disabled', false);
				}
			});
		});
	},

	show_fields: function(event) {
		var $currentTarget = event.type ? $(event.currentTarget) : $(event),
			name = $currentTarget.parent('label').text().split(' ')[1];
		if (name !== undefined) {
			switch (name) {
			case 'Equals':
			case 'Different':
				$currentTarget.closest('.selection-options').find('#div-selection-date').show();
				$currentTarget.closest('.selection-options').find('#div-selected-date').show();
				$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
				$currentTarget.closest('.selection-options').find('#add-date').show();
				break;
			case 'After':
			case 'After&Equals':
			case 'Before':
			case 'Before&Equals':
				$currentTarget.closest('.selection-options').find('#div-selection-date').show();
				$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
				$currentTarget.closest('.selection-options').find('#add-date').hide();
				break;
			case 'Between':
			case 'Not':
				$currentTarget.closest('.selection-options').find('#div-selection-date').hide();
				$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-start-date').show();
				$currentTarget.closest('.selection-options').find('#div-select-end-date').show();
				$currentTarget.closest('.selection-options').find('#add-date').hide();
				break;
			default:
				$currentTarget.closest('.selection-options').find('#div-selection-date').hide();
				$currentTarget.closest('.selection-options').find('#div-selected-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-start-date').hide();
				$currentTarget.closest('.selection-options').find('#div-select-end-date').hide();
				$currentTarget.closest('.selection-options').find('#add-date').hide();
			}
		}
		else {
			this.$el.find('.selection-options').find('#div-selection-date').hide();
			this.$el.find('.selection-options').find('#div-selected-date').hide();
			this.$el.find('.selection-options').find('#div-select-start-date').hide();
			this.$el.find('.selection-options').find('#div-select-end-date').hide();
			this.$el.find('.selection-options').find('#add-date').hide();
		}
	},

	save_data_levels: function() {
		var self = this,
			dataLevels = [];
		_.each(this.data.hierarchies.levels, function(value, key, list) {
			if (list[key].annotations.AnalyzerDateFormat !== undefined || list[key].annotations.SaikuDayFormatString !== undefined) {
				if (list[key].annotations.AnalyzerDateFormat !== undefined) {
					dataLevels.push({
						name: list[key].name,
						analyzerDateFormat: list[key].annotations.AnalyzerDateFormat.replace(/[.]/gi, '\\\.'),
						levelType: list[key].levelType,
						saikuDayFormatString: list[key].annotations.SaikuDayFormatString || ''
					});
				}
				else {
					dataLevels.push({
						name: list[key].name,
						analyzerDateFormat: '',
						levelType: list[key].levelType,
						saikuDayFormatString: list[key].annotations.SaikuDayFormatString || ''
					});
				}
				if (list[key].annotations.SaikuDayFormatString) {
					self.saikuDayFormatString = list[key].annotations.SaikuDayFormatString;
				}
			}
		});

		return dataLevels;
	},

	add_values_fixed_date: function() {
		var self = this;
		this.$el.find('.available-selections').each(function(key, selection) {
			if ($(selection).attr('selection-name') === 'fixed-date') {
				$(selection).find('input:radio').each(function(key, radio) {
					var name = $(radio).attr('id').split('-')[1];
					_.find(self.dataLevels, function(value, key, list) {
						if (name === value.name.toLowerCase()) {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}
						else if (name === 'yesterday' && value.name.toLowerCase() === 'day') {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}
					});
				});

				$(selection).find('input:radio').each(function(key, radio) {
					if ($(radio).val() === null ||
						$(radio).val() === undefined ||
						$(radio).val() === '' ||
						$(radio).val() === 'on') {
						$(radio).addClass('keep-disabled');
					}
				});

			}
		});
	},

	add_values_last_periods: function() {
		var self = this;
		this.$el.find('.available-selections').each(function(key, selection) {
			if ($(selection).attr('selection-name') === 'rolling-date') {
				$(selection).find('#period-select > option').each(function(key, radio) {
					var name = $(radio).attr('name');
					_.find(self.dataLevels, function(value, key, list) {
						if (name === value.levelType) {
							$(radio).val(self.dataLevels[key].analyzerDateFormat);
						}

					});
				});
				$(selection).find('#period-select > option').each(function(key, radio) {
					if ($(radio).attr('value') === null ||
						$(radio).attr('value') === undefined ||
						$(radio).attr('value') === '') {
						$(radio).addClass('keep-disabled');
					}
				});
			}
		});
	},

	selection_date: function(event) {
		var $currentTarget = $(event.currentTarget),
			dateFormat = this.saikuDayFormatString.replace(/yyyy/gi, 'yy');
		$currentTarget.datepicker({
			dateFormat: dateFormat
		});
	},

	clear_selections: function(event) {
		// clear dialog
		this.show_fields(event);
		this.$el.find('input[type="text"]').val('');
		this.$el.find('select').prop('selectedIndex', 0);
		this.$el.find('#selected-date').empty();
		this.$el.find('.available-selections *').prop('checked', false);
		// Clear variables
		this.dates = [];
	},

	disable_divselections: function(event) {
		var params = Array.prototype.slice.call(arguments),
			$currentTarget = event.type ? $(event.currentTarget) : $(event);

		if (!params[1]) {
			this.clear_selections(event);
		}

		this.$el.find('.available-selections').attr('available', false);
		this.$el.find('.available-selections *').prop('disabled', true).off('click');
		$currentTarget.closest('.box-selections').find('.available-selections').attr('available', true);
		$currentTarget.closest('.box-selections').find('.available-selections *:not(.keep-disabled)')
			.prop('disabled', false).on('click');
		if (event.type) {
			$currentTarget.closest('.box-selections').find('select').each(function(key, selection) {
				$(selection).find('option:not([disabled])').first().attr('selected', 'selected');
			});
		}
	},

	day_format_string: function() {
		var dayFormatString = this.saikuDayFormatString;
		dayFormatString = dayFormatString.replace(/[a-zA-Z]/gi, '9');
		return dayFormatString;
	},

	add_selected_date: function(event) {
		event.preventDefault();
		var $currentTarget = $(event.currentTarget),
			dayFormatString = this.day_format_string(),
			sDate = this.$el.find('#selection-date'),
			selectedDate = $currentTarget.closest('.inline-form-group')
				.find('#div-selected-date').find('#selected-date');

		if (sDate.val() !== '') {
			var newDate = Saiku.toPattern(sDate.val(), dayFormatString);
			sDate.css('border', '1px solid #ccc');
			selectedDate.append($('<li></li>')
				.text(newDate)
				.append('<a href="#" class="del-date" data-date="' + newDate + '">x</a>'));
			this.dates.push(newDate);
		}
		else {
			sDate.css('border', '1px solid red');
		}

		sDate.val('');
	},

	del_selected_date: function(event) {
		event.preventDefault();
		var $currentTarget = $(event.currentTarget),
			date = $currentTarget.data('date');
		this.dates = _.without(this.dates, date);
		$currentTarget.parent().remove();
	},

	populate: function() {
		var data = this.get_date_filter();

		if (data && !(_.isEmpty(data))) {
			if (data.type === 'operator') {
				var $selection = this.$el.find('#selection-radio-operator'),
					$checked = this.$el.find('#' + data.checked),
					name = $checked.parent('label').text().split(' ')[1],
					self = this;
				$selection.prop('checked', true);
				$checked.prop('checked', true);
				this.disable_divselections($selection, true);
				this.show_fields($checked);

				this.dates = data.values;

				if (name === 'After' || name === 'After&Equals' ||
					name === 'Before' || name === 'Before&Equals') {
					this.$el.find('#selection-date').val(this.dates[0]);
				}
				else if (name === 'Between') {
					self.$el.find('#start-date').val(this.dates[0]);
					self.$el.find('#end-date').val(this.dates[1]);
				}
				else if (name === 'Not') {
					self.$el.find('#start-date').val(this.dates[0]);
					self.$el.find('#end-date').val(this.dates[1]);
				}
				else {
					_.each(this.dates, function(value, key) {
						self.$el.find('#selected-date').append($('<li></li>')
							.text(value)
							.append('<a href="#" class="del-date" data-date="' + value + '">x</a>'));
					});
				}
			}
			else if (data.type === 'fixed-date') {
				var $selection = this.$el.find('#selection-radio-fixed-date');
				$selection.prop('checked', true);
				this.$el.find('#' + data.checked).prop('checked', true);
				this.disable_divselections($selection, true);
			}
			else {
				var $selection = this.$el.find('#selection-radio-available');
				$selection.prop('checked', true);
				this.$el.find('#date-input').val(data.periodAmount);
				this.$el.find('select#period-select option[id="' + data.periodSelect + '"]').prop('selected', true);
				this.disable_divselections($selection, true);
			}
		}
	},

	populate_mdx: function(logExp, fixedDateName, periodamount) {
		logExp.tagdim = logExp.dimension.replace(/m/g, '\\m').replace(/y/g, '\\y').replace(/q/g, '\\q').replace(/d/g, '\\d');
		logExp.taghier = logExp.hierarchy.replace(/m/g, '\\m').replace(/y/g, '\\y').replace(/q/g, '\\q').replace(/d/g, '\\d');

		if ((logExp.workinglevel !== logExp.level) && logExp.workinglevel !== undefined) {
			logExp.parent = '[{dimension}.{hierarchy}].[{level}].members,';
			logExp.parent = logExp.parent.replace(/{(\w+)}/g, function(m, p) {
				return logExp[p];
			});
		}

		this.template_mdx = this.template_mdx.replace(/{(\w+)}/g, function(m, p) {
			return logExp[p];
		});

		if (fixedDateName === 'dayperiods') {
			logExp.parent = '[{dimension}.{hierarchy}].[{level}]';
			logExp.parent = logExp.parent.replace(/{(\w+)}/g, function(m, p) {
				return logExp[p];
			});

			if (this.dates.length > 1) {
				var len = this.dates.length,
					i;

				for (i = 0; i < len; i++) {
					logExp.dates = this.dates[i];

					if (logExp.comparisonOperator === '>|<') {
						if (i === 0) {
							logExp.comparisonOperator = logExp.comparisonOperator.split('|')[0];
							this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g, function(m, p) {
								return logExp[p];
							});
							logExp.comparisonOperator = '>|<';
						}
						else {
							logExp.logicalOperator = 'AND';
							logExp.comparisonOperator = logExp.comparisonOperator.split('|')[1];
							this.template_days_mdx += this.template_many_years_mdx.replace(/{(\w+)}/g, function(m, p) {
								return logExp[p];
							});
						}
					}
					else {
						if (i === 0) {
							logExp.comparisonOperator = '>';
							this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g, function(m, p) {
								return logExp[p];
							});
						}
						else {
							logExp.logicalOperator = 'OR';
							logExp.comparisonOperator = '<';
							this.template_days_mdx += this.template_many_years_mdx.replace(/{(\w+)}/g, function(m, p) {
								return logExp[p];
							});
						}
					}
				}

				return this.template_days_mdx + ')';
			}
			else {
				logExp.dates = this.dates[0];
				this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g, function(m, p) {
					return logExp[p];
				}) + ')';

				return this.template_days_mdx;
			}
		}
		else if (fixedDateName === 'lastperiods') {
			this.template_last_mdx = this.template_last_mdx.replace(/{(\w+)}/g, function(m, p) {
				return logExp[p];
			});

			return this.template_last_mdx;
		}
		else if (fixedDateName !== 'yesterday') {
			return this.template_mdx;
		}
		else {
			return this.template_mdx + '.lag(1)';
		}
	},

	save: function(event) {
		event.preventDefault();
		// Notify user that updates are in progress
		var $loading = $('<div>Saving...</div>');
		$(this.el).find('.dialog_body').children().hide();
		$(this.el).find('.dialog_body').prepend($loading);

		var self = this,
			fixedDateName,
			mdx,
			parentmembers,
			periodamount,
			comparisonOperator,
			dates,
			selectedData = {};

		if (self.hierarchy === null || self.hierarchy === undefined) {
			self.hierarchy = self.dimension;
		}

		this.$el.find('.available-selections').each(function(key, selection) {
			var analyzerDateFormat;

			if ($(selection).attr('available') === 'true') {
				selectedData.type = $(selection).attr('selection-name');

				if ($(selection).attr('selection-name') === 'operator') {
					$(selection).find('input:radio').each(function (key, radio) {
						if ($(radio).is(':checked') === true) {
							var name = $(radio).parent('label').text().split(' ')[1];
							selectedData.checked = $(radio).attr('id');

							if (name === 'After' || name === 'After&Equals' ||
								name === 'Before' || name === 'Before&Equals') {
								self.dates = [];
								self.dates.push(self.$el.find('#selection-date').val());
							}
							else if (name === 'Between') {
								self.dates = [];
								self.dates.push(self.$el.find('#start-date').val());
								self.dates.push(self.$el.find('#end-date').val());
							}
							else if (name === 'Not') {
								self.dates = [];
								self.dates.push(self.$el.find('#start-date').val());
								self.dates.push(self.$el.find('#end-date').val());
							}

							parentmembers = self.name;
							fixedDateName = 'dayperiods';
							comparisonOperator = $(radio).val();
							selectedData.values = self.dates;
						}
					});
				}
				else if ($(selection).attr('selection-name') === 'fixed-date') {
					$(selection).find('input:radio').each(function (key, radio) {
						if ($(radio).is(":checked") === true) {
							fixedDateName = $(radio).attr('id').split('-')[1];
							analyzerDateFormat = $(radio).val();
							selectedData.checked = $(radio).attr('id');
						}
					});
				}
				else if ($(selection).attr('selection-name') === 'rolling-date') {
					analyzerDateFormat = $('#period-select').find(':selected').val();
					fixedDateName = 'lastperiods';
					periodamount = $(selection).find('input:text').val();
					selectedData.fixedDateName = fixedDateName;
					selectedData.periodAmount = $(selection).find('input:text').val();
					selectedData.periodSelect = $('#period-select').find(':selected').attr('id');
				}

				var p = '';
				var workinglevel;
				for (var i = 0, len = self.dataLevels.length; i < len; i++) {
					if (self.dataLevels[i].analyzerDateFormat === analyzerDateFormat) {
						if (self.dataLevels[i].name === self.name) {
							parentmembers = self.name;
							workinglevel = self.dataLevels[i].name;
						}
						else {
							workinglevel = self.dataLevels[i].name;
						}
					}
				}

				var logExp = {
					dimension: self.dimension,
					hierarchy: self.hierarchy,
					level: self.name,
					parent: p,
					AnalyzerDateFormat: analyzerDateFormat,
					periodamount: periodamount,
					comparisonOperator: comparisonOperator,
					workinglevel: workinglevel
				};

				mdx = self.populate_mdx(logExp, fixedDateName);
			}
		});

		var hName = decodeURIComponent(this.member.hierarchy),
			lName = decodeURIComponent(this.member.level),
			hierarchy = this.workspace.query.helper.getHierarchy(hName),
			cubeSelected = this.get_cube_name();

		selectedData.cube = cubeSelected;
		selectedData.dimension = this.dimension;
		selectedData.hierarchy = this.hierarchy;
		selectedData.name = this.name;
		this.set_date_filter(selectedData);

		if (hierarchy && hierarchy.levels.hasOwnProperty(lName)) {
			hierarchy.levels[lName] = { mdx: mdx, name: lName };
		}

		this.finished();
	},

	get_cube_name: function() {
		return decodeURIComponent($('.cubes option:selected').val()).split('/')[3];
	},

	get_uuid: function(data) {
		return '[' + data.cube + '].[' + data.dimension + '].[' + 
			data.hierarchy + '].[' + data.name + ']';
	},

	set_date_filter: function(data) {
		var dateFilter = this.workspace.dateFilter,
			objDateFilter = dateFilter.toJSON(),
			uuid = this.get_uuid(data);
		
		data.id = uuid;

		if (objDateFilter && !(_.isEmpty(objDateFilter))) {
			if (dateFilter.get(uuid)) {
				dateFilter = dateFilter.get(uuid);
				dateFilter.set(data);
			}
			else {
				dateFilter.add(data);				
			}
		}
		else {
			dateFilter.add(data);
		}
	},

	get_date_filter: function() {
		var data = {
			cube: this.get_cube_name(),
			dimension: this.dimension,
			hierarchy: this.hierarchy,
			name: this.name
		};

		var uuid = this.get_uuid(data),
			data = this.workspace.dateFilter.get(uuid);

		data = data ? data.toJSON() : [];

		return data;
	},

	finished: function() {
		this.$el.dialog('destroy').remove();
		this.query.run();
	}
});

/**
 * Observer to remove elements in the date filter model
 */
var DateFilterObserver = Backbone.View.extend({
	initialize: function(args) {
		// Keep track of parent workspace
		this.workspace = args.workspace;

		// Maintain `this` in callbacks
		_.bindAll(this, 'receive_data', 'workspace_levels');

		// Listen to result event
		this.workspace.bind('query:result', this.receive_data);
		Saiku.session.bind('dimensionList:select_dimension', this.receive_data);
		Saiku.session.bind('workspaceDropZone:select_dimension', this.receive_data);
		Saiku.session.bind('workspaceDropZone:clear_axis', this.receive_data);
	},

    receive_data: function(args) {
		var objDateFilter = this.workspace.dateFilter.toJSON();

		if (objDateFilter && !(_.isEmpty(objDateFilter))) {
        	return _.delay(this.workspace_levels, 1000, args);
        }
    },

	get_cube_name: function() {
		return decodeURIComponent($('.cubes option:selected').val()).split('/')[3];
	},

    workspace_levels: function(args) {
    	var cubeName = this.get_cube_name(),
    		axisColumns = this.workspace.query.helper.getAxis('COLUMNS'),
    		axisRows = this.workspace.query.helper.getAxis('ROWS'),
    		axisFilter = this.workspace.query.helper.getAxis('FILTER'),
    		arrData = [];

    	if (axisColumns.location === 'COLUMNS' && axisColumns.hierarchies.length > 0) {
    		arrData.push(this.get_axes(cubeName, axisColumns));
    	}
    	if (axisRows.location === 'ROWS' && axisRows.hierarchies.length > 0) {
			arrData.push(this.get_axes(cubeName, axisRows));
    	}
    	if (axisFilter.location === 'FILTER' && axisFilter.hierarchies.length > 0) {
			arrData.push(this.get_axes(cubeName, axisFilter));
    	}

    	arrData = _.compact(_.union(arrData[0], arrData[1], arrData[2]));

    	this.check_dateFilter_model(arrData);
    },

    get_axes: function(cubeName, axis) {
    	var arrAxis = [],
    		len = axis.hierarchies.length,
    		i;
		
		for (i = 0; i < len; i++) {
			for (var name in axis.hierarchies[i].levels) {
				if (axis.hierarchies[i].levels.hasOwnProperty(name)) {
					arrAxis.push('[' + cubeName + '].[' + axis.hierarchies[i].dimension + '].[' + 
						axis.hierarchies[i].caption + '].[' + name + ']');
				}
			}
		}

		return arrAxis;
    },

    check_dateFilter_model: function(data) {
    	var arrRemove = [],
    		arrChecked = [],
    		objDateFilter = this.workspace.dateFilter.toJSON(),
    		lenDateFilter = objDateFilter.length,
    		lenData = data.length,
    		aux = 0,
    		i = 0;

    	if (lenData > 0 && (objDateFilter && !(_.isEmpty(objDateFilter)))) {
    		while (i < lenData) {
	    		if (data[i] === objDateFilter[aux].id) {
	    			arrChecked.push(objDateFilter[aux].id);
	    			if ((aux + 1) < lenDateFilter) {
	    				aux++;
	    			}
	    			else {
	    				aux = 0;
	    				i++;
	    			}
	    		}
	    		else {
	    			arrRemove.push(objDateFilter[aux].id);
	    			if ((aux + 1) < lenDateFilter) {
	    				aux++;
	    			}
	    			else {
	    				aux = 0;
	    				i++;
	    			}
	    		}
    		}
		}
		else if (lenData === 0 && (objDateFilter && !(_.isEmpty(objDateFilter)))) {
			for (var j = 0; j < lenDateFilter; j++) {
				this.workspace.dateFilter.remove(objDateFilter[j].id);	
			}
		}

		this.remove_dateFilter_model(_.difference(arrRemove, arrChecked));
    },

    remove_dateFilter_model: function(data) {
    	var lenData = data.length,
    		i;

    	for (i = 0; i < lenData; i++) {
    		this.workspace.dateFilter.remove(data[i]);
    	}
    }
});

 /**
  * Start DateFilterObserver
  */
Saiku.events.bind('session:new', function() {

	function new_workspace(args) {
		if (typeof args.workspace.dateFilterObserver === 'undefined') {
			args.workspace.dateFilterObserver = new DateFilterObserver({ workspace: args.workspace });
		}
	}

	// Add new tab content
	for (var i = 0, len = Saiku.tabs._tabs.length; i < len; i++) {
		var tab = Saiku.tabs._tabs[i];
		new_workspace({
			workspace: tab.content
		});
	}

	// New workspace
	Saiku.session.bind('workspace:new', new_workspace);
});
