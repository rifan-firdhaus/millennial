(function ($) {
    window.DateTime = luxon.DateTime;

    var YearPicker = function (calendar) {
        var _year = null;
        var _range = {start: null, end: null};

        this.calendar = function () {
            return calendar;
        };

        this.$wrapper = $('<div/>', {
            'class': this.CLASSES.wrapper
        });

        this.$label = $('<div/>', {
            'class': this.CLASSES.label
        });

        this.getOffset = function () {
            return 8 * this.calendar().option('monthToDisplay');
        };

        this.getRange = function () {
            return _range;
        };

        this.setYear = function (year) {
            _year = year;

            this.getRange().start = year - this.getOffset();
            this.getRange().end = year + this.getOffset() - 1;

            this.render();
            this.calendar().monthPicker().setLabel(year);

            return this;
        };

        this.getYear = function () {
            return _year;
        };

        this.next = function () {
            this.setYear(this.getRange().end + this.getOffset() + 1);
        };

        this.prev = function () {
            this.setYear(this.getRange().start - this.getOffset());
        };

        this.show = function (year) {
            if (typeof year !== "undefined") {
                this.setYear(year);
            }

            this.calendar().monthPicker().hide();
            this.calendar().$wrapper.addClass(this.CLASSES.showed);

            return this;
        };

        this.hide = function () {
            this.calendar().$wrapper.removeClass(this.CLASSES.showed);

            return this;
        };

        this.isVisible = function () {
            return this.calendar().$wrapper.hasClass(this.CLASSES.showed);
        };

        this.toggle = function () {
            if (this.isVisible()) {
                return this.hide();
            }

            return this.show();
        };

        this.render = function () {
            this.$wrapper.empty();

            for (let year = this.getRange().start; year <= this.getRange().end; year++) {
                var $year = $('<div/>', {
                    'class': this.CLASSES.item,
                    'text': year
                });

                $year.width((25 / this.calendar().option('monthToDisplay')) + "%");

                if (this.calendar().current().year === year) {
                    $year.addClass(this.CLASSES.selectedItem);
                }

                $year.appendTo(this.$wrapper).data('year', year);
            }

            this.$label.text(_range.start + ' - ' + _range.end);

            return this;
        };

        this.$wrapper.appendTo(this.calendar().$body);
        this.$label.appendTo(this.calendar().$header);

        this.$wrapper.on('click', '.' + this.CLASSES.item, $.proxy(function (event) {
            var $year = $(event.currentTarget);

            this.setYear($year.data('year'));
            this.hide();
            this.calendar().monthPicker().show();
        }, this));
    };

    YearPicker.prototype.CLASSES = {
        wrapper: 'mil-cal-year-selector',
        showed: 'mil-cal-year-selector-showed',
        item: 'mil-cal-year-selector-item',
        selectedItem: 'mil-cal-year-selector-item-selected',
        label: 'mil-cal-year-selector-label',
    };

    var MonthPicker = function (calendar) {
        var _month = null;


        this.$wrapper = $('<div/>', {
            'class': this.CLASSES.wrapper
        });

        this.$label = $('<div/>', {
            'class': this.CLASSES.label
        });

        this.setLabel = function (value) {
            this.$label.text(value).addClass('changed');

            setTimeout(() => this.$label.removeClass('changed'),300);
        };

        this.calendar = function () {
            return calendar;
        };

        this.setMonth = function (month) {
            _month = month;

            this.calendar().render({
                year: this.calendar().yearPicker().getYear(),
                month: month,
                day: 1
            });

            return this;
        };

        this.getMonth = function () {
            return _month;
        };

        this.render = function () {
            var months = luxon.Info.months('short');

            for (let index in months) {
                var $month = $('<div/>', {
                    'class': this.CLASSES.item,
                    'text': months[index]
                });

                $month.appendTo(this.$wrapper).data('month', parseInt(index) + 1);
            }

            return this;
        };

        this.show = function (year) {
            if (typeof year !== "undefined") {
                this.calendar().yearPicker().setYear(year);
            }

            this.calendar().$wrapper.addClass(this.CLASSES.showed);

            return this;
        };

        this.hide = function () {
            this.calendar().$wrapper.removeClass(this.CLASSES.showed);

            return this;
        };

        this.isVisible = function () {
            return this.calendar().$wrapper.hasClass(this.CLASSES.showed);
        };

        this.toggle = function (year) {
            if (this.isVisible()) {
                return this.hide();
            }

            return this.show(year);
        };

        this.$wrapper.appendTo(this.calendar().$body);
        this.$label.appendTo(this.calendar().$header);

        this.$label.on('click', $.proxy(this.calendar().yearPicker().show, this.calendar().yearPicker(), undefined));

        this.$wrapper.on('click', '.' + this.CLASSES.item, $.proxy(function (event) {
            var $month = $(event.currentTarget);

            this.setMonth($month.data('month'));

            setTimeout(() => this.hide(),1);

        }, this));

        return this.render();
    };

    MonthPicker.prototype.CLASSES = {
        wrapper: 'mil-cal-month-selector',
        showed: 'mil-cal-month-selector-showed',
        item: 'mil-cal-month-selector-item',
        selectedItem: 'mil-cal-month-selector-item-selected',
        label: 'mil-cal-month-selector-label',
    };

    Calendar = function (options) {
        var _defaults = {
            'format': 'MMMM dd yyyy, h:mm:ss a',
            'min': null,
            'max': null,
            'dayCallback': $.noop,
            'weekCallback': $.noop,
            'monthCallback': $.noop,
            'onSelect': $.noop,
            'firstDay': 7,
            'multiselect': true,
            'monthToDisplay': 1,
            'allowEmpty': false,
            'dateRange': true,
            'disables': []
        };

        var _today;
        var _options = $.extend({}, _defaults, options);
        var _current = null;
        var _currentEnd = null;
        var _selections = [];
        var _self = this;
        var _lastSelect;
        var _disables = [];
        var _rendered = false;
        var _selectInRange = false;

        this.$wrapper = $('<div/>', {
            'class': 'mil-cal-wrapper'
        });

        this.$header = $('<div/>', {
            'class': 'mil-cal-header'
        });

        this.$monthYearDisplay = $('<div/>', {
            'class': 'mil-cal-month-year-display-wrapper'
        });

        this.$monthYear = $('<div/>', {
            'class': 'mil-cal-month-year-display'
        });

        this.$month = $('<div/>', {
            'class': 'mil-cal-month-display'
        });

        this.$year = $('<div/>', {
            'class': 'mil-cal-year-display'
        });

        this.$monthYearEnd = $('<div/>', {
            'class': 'mil-cal-month-year-display'
        });

        this.$monthEnd = $('<div/>', {
            'class': 'mil-cal-month-display'
        });

        this.$yearEnd = $('<div/>', {
            'class': 'mil-cal-year-display'
        });

        this.$body = $('<div/>', {
            'class': 'mil-cal-body'
        });

        this.$months = $('<div/>', {
            'class': 'mil-cal-months'
        });

        this.$footer = $('<div/>', {
            'class': 'mil-cal-footer'
        });

        this.$next = $('<div/>', {
            'class': 'mil-cal-next',
        });

        this.$prev = $('<div/>', {
            'class': 'mil-cal-prev',
        });

        this.$today = $('<div/>', {
            'class': 'mil-cal-selected',
        });

        this.$toolbar = $('<div/>', {
            'class': 'mil-cal-toolbar'
        });

        var _yearPicker;
        var _monthPicker;

        this.today = function () {
            if (!_today) {
                _today = this.normalizeDate(DateTime.local());
            }

            return _today;
        };

        this.isToday = function (date) {
            date = this.normalizeDate(date);

            return this.today().hasSame(date, 'day');
        };

        this.yearPicker = function () {
            if (!_yearPicker) {
                _yearPicker = new YearPicker(this);
            }

            return _yearPicker;
        };

        this.monthPicker = function () {
            if (!_monthPicker) {
                _monthPicker = new MonthPicker(this);
            }

            return _monthPicker;
        };

        this.option = function (key, defaultValue) {
            if (typeof key !== 'undefined') {
                return typeof _options[key] !== 'undefined' ? _options[key] : defaultValue;
            }

            return _options;
        };

        this.current = function () {
            return _current;
        };

        this.home = function () {
            if (this.yearPicker().isVisible()) {
                this.yearPicker().setYear(this.current().year);
            } else if (this.monthPicker().isVisible()) {
                this.yearPicker().setYear(this.current().year);
            } else {
                this.render(this.today());
            }

            return this;
        };

        this.prev = function () {
            if (this.yearPicker().isVisible()) {
                this.yearPicker().prev();
            } else if (this.monthPicker().isVisible()) {
                this.yearPicker().setYear(this.yearPicker().getYear() - 1);
            } else {
                this.render(this.current().minus({'month': 1}));
            }

            return this;
        };

        this.next = function () {
            if (this.yearPicker().isVisible()) {
                this.yearPicker().next();
            } else if (this.monthPicker().isVisible()) {
                this.yearPicker().setYear(this.yearPicker().getYear() + 1);
            } else {
                this.render(this.current().plus({'month': 1}));
            }

            return this;
        };

        this.isDisabled = function (date) {
            date = this.normalizeDate(date);

            return _disables.map(disable => disable.ts).indexOf(date.ts) > -1;
        };

        this.isSelected = function (date) {
            date = this.normalizeDate(date);

            return _selections.map(selection => selection.ts).indexOf(date.ts) > -1;
        };

        this.select = function (date, fromDate, _hard) {
            typeof _hard !== "undefined" || (_hard = true);

            if (date instanceof Array) {
                for (let index in date) {
                    this.select(date[index]);
                }

                return;
            }

            date = this.normalizeDate(date);

            if (this.isDisabled(date)) {
                return this;
            }

            if (!this.isSelected(date)) {
                if (!this.option('multiselect')) {
                    _selections = [];
                }

                _lastSelect = date;
                _selections.push(date);
            }

            if (fromDate) {
                fromDate = this.normalizeDate(fromDate);
                var isLeft = fromDate < date;

                while ((isLeft && date > fromDate) || (!isLeft && date < fromDate)) {
                    var modifier = isLeft ? 'minus' : 'plus';
                    date = date[modifier]({day: 1});

                    this.select(date, null, false);
                }
            }

            !_hard || this._loadSelectedDay();

            return this;
        };

        this.value = function (formatted) {
            var selections = _selections;

            if (formatted || typeof formatted === 'undefined') {
                selections = this.map(selections);
            }

            return this.option('multiselect') ? selections : selections[0]
        };

        this.clearSelection = function () {
            var minimumInput = this.option('allowEmpty') ? 0 : 1;

            while (_selections.length > minimumInput) {
                this.unselect(_selections[0]);
            }

            return this;
        };

        this.map = function (dates) {
            return dates.map(date => date.toFormat(this.option('format')));
        };

        this.unselect = function (date) {
            if (date instanceof Array) {
                for (let index in date) {
                    this.unselect(date[index]);
                }

                return this;
            }

            if (!this.option('allowEmpty') && this.value(false).length === 1) {
                return this;
            }

            date = this.normalizeDate(date);
            var selectionIndex = _selections.map(selection => selection.ts).indexOf(date.ts);

            if (selectionIndex === -1) {
                return this;
            }

            _selections.splice(selectionIndex, 1);
            this._loadSelectedDay();

            return this;
        };

        this.toggleSelect = function (date, fromDatetime) {
            date = this.normalizeDate(date);

            if (fromDatetime || !this.isSelected(date)) {
                this.select(date, fromDatetime);
            } else {
                this.unselect(date);
            }
        };

        this.disable = function (date) {
            if (date instanceof Array) {
                for (let index in date) {
                    this.disable(date[index]);
                }

                return;
            }

            date = this.normalizeDate(date);

            _disables.push(date);
            this.unselect(date);

            !this.isRendered() || this.render(_current);
        };

        this.isRendered = function () {
            return _rendered;
        };

        this.render = function (date) {
            date = this.normalizeDate(date);
            _current = date;

            this.$months.empty();

            for (let index = 0; index < this.option('monthToDisplay'); index++) {
                this._renderMonth(date);

                _currentEnd = date;
                date = date.plus({month: 1});
            }

            this._renderHeader();
            this._loadSelectedDay();

            _rendered = true;
        };

        this.normalizeDate = function (date) {
            if (date instanceof Array) {
                return $.map(date, $.proxy(this.normalizeDate, this));
            }

            var result = null;

            if (typeof date === 'object') {
                if (typeof date.c === 'object') {
                    result = date;
                } else if (date instanceof Date) {
                    result = DateTime.fromJSDate(date);
                } else {
                    result = DateTime.fromObject(date);
                }
            } else {
                result = DateTime.fromFormat(this.option('format'), date);
            }

            return result.startOf('day');
        };

        this._renderHeader = function () {
            this.$year.text(this.current().year);
            this.$month.text(this.current().monthLong);

            if (this.option('monthToDisplay ') > 1) {
                this.$yearEnd.text(_currentEnd.year);
                this.$monthEnd.text(_currentEnd.monthLong);
            }
        };

        this._renderWeek = function () {
            var $week = $('<div/>', {
                'class': 'mil-cal-week'
            });

            if (typeof this.option('weekCallback') === 'function') {
                this.option('weekCallback').call(this, $week);
            }

            return $week;
        };

        this._renderDay = function (date, currentDate) {
            var $dayWrapper = $('<div/>', {
                'class': 'mil-cal-day-wrapper'
            });
            var $day = $('<div/>', {
                'class': 'mil-cal-day'
            });

            if (date.month < currentDate.month) {
                $dayWrapper.addClass('mil-cal-day-prev-month');
            } else if (date.month > currentDate.month) {
                $dayWrapper.addClass('mil-cal-day-next-month');
            } else {
                $dayWrapper.addClass('mil-cal-day-current-month');
            }

            if (_self.isDisabled(date)) {
                $dayWrapper.addClass('mil-cal-day-disabled');
            }

            if (_self.isToday(date)) {
                $dayWrapper.addClass('mil-cal-day-today');
            }
            $dayWrapper.data('date', date).append($day);
            $day.text(date.day);

            if (typeof this.option('dayCallback') === 'function') {
                this.option('dayCallback').call(this, date, $dayWrapper);
            }

            return $dayWrapper;
        };

        this._renderMonthHeader = function (date, monthName) {
            var weeks = luxon.Info.weekdays('narrow');
            var first = weeks.slice(this.option('firstDay') - 1);
            var last = weeks.slice(0, this.option('firstDay') - 1);
            var $dayNames = $('<div/>', {
                'class': 'mil-cal-day-names',
            });

            for (let index in first.concat(last)) {
                var $dayName = $('<div/>', {
                    'class': 'mil-cal-day-name',
                    'text': weeks[index]
                });

                $dayNames.append($dayName);
            }

            if (monthName) {
                var $monthName = $('<div/>', {
                    'class': 'mill-call-month-name',
                    'text': date.monthLong + ' ' + date.year
                });

                return $monthName.add($dayNames)
            }

            return $dayNames;
        };

        this._renderMonth = function (date) {
            var $days = $();
            var start = date.startOf('month');
            var end = date.endOf('month');
            var displayMonthName = this.option('monthToDisplay') > 1;
            var $month = $('<div/>', {'class': 'mil-cal-month'});

            if (start.weekday !== this.option('firstDay')) {
                var remain = start.weekday - this.option('firstDay');

                if (remain < 0) {
                    remain = (7 - Math.abs(remain));
                }

                start = start.minus({'day': Math.abs(remain)});
            }

            $month.append(this._renderMonthHeader(date, displayMonthName));

            while (start <= end || start.weekday !== this.option('firstDay')) {
                $days = $days.add(this._renderDay(start, date));

                if ($days.length === 7) {
                    this._renderWeek().appendTo($month).append($days);
                    $days = $();
                }

                start = start.plus({'day': 1});
            }

            if (typeof this.option('monthCallback') === 'function') {
                this.option('monthCallback').call(this, start, end, $month);
            }

            return $month.appendTo(this.$months);
        };

        this._loadSelectedDay = function () {
            if (!_selections) {
                return;
            }

            var $lastSelected = false;
            var $days = _self.$body.find('.mil-cal-day-wrapper');

            $days.removeClass('mil-cal-day-selected-first mil-cal-day-selected-last mil-cal-day-selected');

            $days.filter(function () {
                return _self.isSelected($(this).data('date'));
            }).addClass('mil-cal-day-selected');

            $days.each(function () {
                var $this = $(this);
                var isSelected = $this.hasClass('mil-cal-day-selected');

                if (isSelected && $lastSelected === false) {
                    $this.addClass('mil-cal-day-selected-first');
                } else if (!isSelected && $lastSelected) {
                    $lastSelected.addClass('mil-cal-day-selected-last');
                    $lastSelected = false
                }

                if (isSelected) {
                    $lastSelected = $this;
                }
            })
        };

        // TODO: Refactor this code
        var unmarkSelectInRange = function () {
            if (_selectInRange) {
                _self.$wrapper.removeClass('mil-cal-month-select-in-range');
                _self.$wrapper.find('.mil-cal-day-over:not(.mil-cal-day-disabled)').removeClass('mil-cal-day-over-first mil-cal-day-over-last mil-cal-day-over');
                _selectInRange = false;
            }
        };

        // TODO: Refactor this code
        var markSelectInRange = function (date) {
            unmarkSelectInRange();

            _self.$wrapper.addClass('mil-cal-month-select-in-range');
            _selectInRange = true;

            var isRight = _lastSelect <= date;

            _self.$wrapper.find('.mil-cal-day-wrapper:not(.mil-cal-day-disabled)').filter(function () {
                var _date = $(this).data('date');

                if (isRight) {
                    return _date >= _lastSelect && _date <= date;
                }

                return _date <= _lastSelect && _date >= date;
            }).addClass('mil-cal-day-over');

            var $lastOver = false;

            _self.$body.find('.mil-cal-day-wrapper').each(function () {
                var $this = $(this);
                var isOver = $this.hasClass('mil-cal-day-over');

                if (isOver && $lastOver === false) {
                    $this.addClass('mil-cal-day-over-first');
                } else if (!isOver && $lastOver) {
                    $lastOver.addClass('mil-cal-day-over-last');
                    $lastOver = false
                }

                if (isOver) {
                    $lastOver = $this;
                }
            })
        };

        this.$body.append(this.$months);

        this.$header
            .append(this.$monthYearDisplay)
            .append(this.$toolbar);

        this.$toolbar
            .append(this.$prev)
            .append(this.$today)
            .append(this.$next);

        this.$monthYear
            .append(this.$month)
            .append(this.$year)
            .appendTo(this.$monthYearDisplay);

        this.$wrapper
            .append(this.$header)
            .append(this.$body)
            .append(this.$footer);

        if (this.option('monthToDisplay') > 1) {
            this.$monthYearEnd
                .append(this.$monthEnd)
                .append(this.$yearEnd)
                .insertAfter(this.$monthYear);
        }

        this.$next.on('click', $.proxy(this.next, this));
        this.$prev.on('click', $.proxy(this.prev, this));
        this.$today.on('click', $.proxy(this.home, this));
        this.monthPicker();
        this.yearPicker();

        this.$wrapper.on('click', '.mil-cal-day-wrapper', $.proxy(function (event) {
            this.toggleSelect($(event.currentTarget).data('date'), event.shiftKey && _lastSelect ? _lastSelect : false);
        }, this));

        this.$monthYearDisplay.on('click', () => this.monthPicker().toggle(this.current().year));

        this.$body.on('mousewheel', $.proxy(function (event) {
            if (event.originalEvent.wheelDelta > 0) {
                this.prev();
            } else {
                this.next();
            }

            return false;
        }, this));

        this.$wrapper.on('mouseover', '.mil-cal-day-wrapper', function (event) {
            if (!event.shiftKey || !_lastSelect) {
                unmarkSelectInRange();
                return;
            }

            var datetime = $(event.currentTarget).data('date');

            markSelectInRange(datetime)
        });

        this.disable(this.option('disables'));
        this.select(this.today());
        this.render(this.today());

        this.$wrapper.data('Calendar', this);

        return this;
    };

    var Millennial = function ($element, options) {
        var _options = $.extend({}, this.defaults, options);

        this.option = function (key, defaultValue) {
            if (typeof key !== 'undefined') {
                return typeof _options[key] !== 'undefined' ? _options[key] : defaultValue;
            }

            return _options;
        };
    };

    $.fn.millennial = function (first, second) {
        var millennial = this.data('stick');

        if (millennial) {
            if (typeof millennial[first] === 'function') {
                return millennial[first](second);
            }

            return false;
        } else {
            millennial = new Millennial(this, first);

            this.data('stick', millennial);
        }

        return this;
    }

})(jQuery);