(function ($) {
    window.DateTime = luxon.DateTime;

    window.Calendar = function (options) {
        var _defaults = {
            defaultDate: DateTime.local(),
            format: 'MMMM dd yyyy, h:mm:ss a',
            dayCallback: $.noop,
            weekCallback: $.noop,
            monthCallback: $.noop,
            onSelect: $.noop,
            firstDayOfWeek: 7,
            multiselect: false,
            allowEmpty: false,
            disableDates: [
                DateTime.local().plus({'day': 4}),
                DateTime.local().minus({'day': 9}),
                {
                    'day': 1,
                    'month': 7,
                    'year': 2018
                }
            ]
        };

        var _options = $.extend({}, _defaults, options);
        var _current = null;
        var _selections = [];
        var _selectionsISO = [];
        var _self = this;
        var _lastSelect;
        var _disableDates = [];
        var _disableDatesISO = [];
        var _rendered = false;

        this.$wrapper = $('<div/>', {
            'class': 'mil-calendar-wrapper'
        });

        this.$header = $('<div/>', {
            'class': 'mil-calendar-header'
        });

        this.$monthYear = $('<div/>', {
            'class': 'mil-calendar-month-year-selector'
        });

        this.$month = $('<div/>', {
            'class': 'mil-calendar-month-selector'
        });

        this.$year = $('<div/>', {
            'class': 'mil-calendar-year-selector'
        });

        this.$body = $('<div/>', {
            'class': 'mil-calendar-body'
        });

        this.$footer = $('<div/>', {
            'class': 'mil-calendar-footer'
        });

        this.$next = $('<a/>', {
            'class': 'mil-calendar-next',
            'href': '#'
        });

        this.$prev = $('<a/>', {
            'class': 'mil-calendar-prev',
            'href': '#'
        });

        this.$today = $('<a/>', {
            'class': 'mil-calendar-selected',
            'href': '#'
        });

        this.$toolbar = $('<div/>', {
            'class': 'mil-calendar-toolbar'
        });

        this.option = function (key, defaultValue) {
            if (typeof key !== 'undefined') {
                return typeof _options[key] !== 'undefined' ? _options[key] : defaultValue;
            }

            return _options;
        };

        this.prev = function () {
            this.render(_current.minus({'month': 1}));
        };

        this.next = function () {
            this.render(_current.plus({'month': 1}));
        };

        this.isDisabled = function (datetime) {
            datetime = this.normalizeDatetime(datetime);

            return $.inArray(datetime.toISODate(), _disableDatesISO) > -1;
        };

        this.select = function (datetime) {
            if ($.isArray(datetime)) {
                for (var index in datetime) {
                    this.unselect(datetime[index]);
                }

                return;
            }

            datetime = this.normalizeDatetime(datetime);

            if (this.isDisabled(datetime)) {
                return;
            }

            if (!_options.multiselect) {
                _selections = [];
            }

            _lastSelect = datetime;

            _selections.push(datetime);

            _selectionsISO = this.mapToISO(_selections);

            markSelectedDay();
        };

        this.mapToISO = function (datetimes) {
            return $.map(datetimes, function (datetime) {
                return datetime.toISODate();
            });
        };

        this.value = function () {
            var selections = $.map(_selections, function (selection) {
                return selection.toFormat(_options.format);
            });

            return _options.multiselect ? selections : selections[0]
        };

        this.clearSelection = function () {
            var minimumInput = _options.allowEmpty ? 0 : 1;

            while (_selections.length > minimumInput) {
                this.unselect(_selections[0]);
            }
        };

        this.normalizeDatetime = function (datetimes) {
            if ($.isArray(datetimes)) {
                for (var index in datetimes) {
                    datetimes[index] = this.normalizeDatetime(datetimes[index]);
                }

                return datetimes;
            }

            if (typeof datetimes === 'object') {
                if (typeof datetimes.c === 'object') {
                    return datetimes;
                } else if (datetimes instanceof Date) {
                    return DateTime.fromJSDate(datetimes);
                } else {
                    return DateTime.fromObject(datetimes);
                }
            }

            return DateTime.fromFormat(_options.format, datetimes);
        };

        this.unselect = function (datetime) {
            if ($.isArray(datetime)) {
                for (var index in datetime) {
                    this.unselect(datetime[index]);
                }

                return;
            }

            if (!_options.allowEmpty && _selections.length === 1) {
                return;
            }

            datetime = this.normalizeDatetime(datetime);

            var isoDate = datetime.toISODate();

            if ($.inArray(isoDate, _selectionsISO) === -1) {
                return;
            }

            _selections.splice(_selectionsISO.indexOf(isoDate), 1);

            _selectionsISO = this.mapToISO(_selections);

            markSelectedDay();
        };

        this.toggleSelect = function (datetime) {
            datetime = this.normalizeDatetime(datetime);

            if ($.inArray(datetime.toISODate(), _selectionsISO) === -1) {
                this.select(datetime);
            } else {
                this.unselect(datetime);
            }
        };

        this.disable = function (datetime) {
            if ($.isArray(datetime)) {
                for (var index in datetime) {
                    this.disable(datetime[index]);
                }

                return;
            }

            datetime = this.normalizeDatetime(datetime);

            _disableDates.push(datetime);

            this.unselect(datetime);

            _disableDatesISO = this.mapToISO(_disableDates);

            if (_rendered) {
                this.render(_current);
            }
        };

        this.render = function (datetime) {
            datetime = this.normalizeDatetime(datetime);
            _current = datetime;

            this.$body.empty();

            renderMonth(datetime);
            renderHeader();
            markSelectedDay();

            _rendered = true;
        };

        var renderHeader = function () {
            _self.$year.text(_current.year);
            _self.$month.text(_current.monthLong);
        };

        var renderWeek = function () {
            var $week = $('<div/>', {
                'class': 'mil-calendar-week'
            });

            if (typeof _options.weekCallback === 'function') {
                _options.weekCallback.call(this, $week);
            }

            return $week;
        };

        var renderDay = function (datetime) {
            var $dayWrapper = $('<div/>', {
                'class': 'mil-calendar-day-wrapper'
            });
            var $day = $('<div/>', {
                'class': 'mil-calendar-day'
            });

            if (datetime.month < _current.month) {
                $dayWrapper.addClass('mil-calendar-day-prev-month');
            } else if (datetime.month > _current.month) {
                $dayWrapper.addClass('mil-calendar-day-next-month');
            } else {
                $dayWrapper.addClass('mil-calendar-day-current-month');
            }

            if ($.inArray(datetime.toISODate(), _disableDatesISO) > -1) {
                $dayWrapper.addClass('mil-calendar-day-disabled');
            }

            $dayWrapper.data('date', datetime).append($day);
            $day.text(datetime.day);

            if (typeof _options.dayCallback === 'function') {
                _options.dayCallback.call(this, datetime, $dayWrapper);
            }

            return $dayWrapper;
        };

        var renderMonth = function (datetime) {
            var daysInWeek = 1;
            var $week = null;
            var startDate = DateTime.fromObject({
                day: 1,
                month: datetime.c.month,
                year: datetime.c.year
            });
            var endDate = DateTime.fromObject({
                day: datetime.daysInMonth,
                month: datetime.c.month,
                year: datetime.c.year
            });

            if (startDate.weekday !== _options.firstDayOfWeek) {
                var remain = startDate.weekday - _options.firstDayOfWeek;

                if (remain < 0) {
                    remain = (7 - Math.abs(remain));
                }

                startDate = startDate.minus({'day': Math.abs(remain)});
            }

            var $month = $('<div/>', {'class': 'mil-calendar-month'});

            if (typeof _options.monthCallback === 'function') {
                _options.monthCallback.call(this, startDate, endDate, $month);
            }

            while (startDate <= endDate || startDate.weekday !== _options.firstDayOfWeek) {
                if (daysInWeek === 1) {
                    $week = renderWeek();
                    $week.appendTo($month);
                }

                var $day = renderDay(startDate);

                $week.append($day);

                if (daysInWeek === 7) {
                    daysInWeek = 0;
                }

                startDate = startDate.plus({'day': 1});
                daysInWeek++;
            }

            return $month.appendTo(_self.$body);
        };

        var markSelectedDay = function () {
            if (!_current || !_selections) {
                return;
            }

            _self.$body.find('.mil-calendar-day-wrapper').removeClass('mil-calendar-day-selected-day-first mil-calendar-day-selected-day-last mil-calendar-day-selected-day');

            _self.$body.find('.mil-calendar-day-wrapper')
                .filter(function () {
                    var _datetime = $(this).data('date');

                    return $.inArray(_datetime.toISODate(), _selectionsISO) > -1;
                })
                .addClass('mil-calendar-day-selected-day');

            var selected = false;

            _self.$body.find('.mil-calendar-day-wrapper').each(function () {
                var $this = $(this);
                var isSelected = $this.hasClass('mil-calendar-day-selected-day');

                if (isSelected && selected === false) {
                    $this.addClass('mil-calendar-day-selected-day-first');
                } else if (!isSelected && selected) {
                    selected.addClass('mil-calendar-day-selected-day-last');
                    selected = false
                }

                if (isSelected) {
                    selected = $this;
                }
            })
        };

        this.$header
            .append(this.$monthYear)
            .append(this.$toolbar);

        this.$toolbar
            .append(this.$next)
            .append(this.$today)
            .append(this.$prev);

        this.$monthYear
            .append(this.$month)
            .append(this.$year);

        this.$wrapper
            .append(this.$header)
            .append(this.$body)
            .append(this.$footer)
            .data('Calendar', this);

        this.$next.on('click', function (event) {
            event.preventDefault();

            _self.next();
        });

        this.$prev.on('click', function (event) {
            event.preventDefault();

            _self.prev();
        });

        this.$today.on('click', function (event) {
            event.preventDefault();

            _self.render(_selections[0]);
        });

        this.$wrapper.on('click', '.mil-calendar-day-wrapper', function (event) {
            event.preventDefault();

            _self.toggleSelect($(event.currentTarget).data('date'));
        });

        _options.defaultDate = this.normalizeDatetime(_options.defaultDate);

        this.disable(_options.disableDates);
        this.select(_options.defaultDate);
        this.render(_options.defaultDate);

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