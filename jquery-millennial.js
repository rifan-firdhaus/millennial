(function ($) {
    var DateTime = luxon.DateTime;

    var MonthPicker = (function () {

        /** Constructor of MonthPicker Class **/
        var MonthPickerConstructor = function (calendar) {
            var _month = null;

            /**
             * @returns {Calendar}
             */
            this.calendar = function () {
                return calendar;
            };

            /**
             * @returns {number}
             */
            this.getMonth = function () {
                return _month;
            };

            /**
             * @param {number} year
             * @param {number} month
             * @returns {MonthPickerConstructor}
             */
            this.setMonth = function (year, month) {
                _month = month;

                _setLabel.call(this, year);

                this.calendar().render({
                    year: this.calendar().yearPicker().getYear(),
                    month: month,
                    day: 1
                });

                return this;
            };

            _elements.call(this);
            _build.call(this);
            _bindEvent.call(this);
            _render.call(this);

            return this;
        };

        /** Private Method of MonthPicker Class **/
        var
            /**
             * @private
             */
            _elements = function () {
                this.$wrapper = $("<div/>", {
                    "class": this.classes.wrapper
                });

                this.$label = $("<div/>", {
                    "class": this.classes.label
                });
            },

            /**
             * @private
             */
            _build = function () {
                this.$wrapper.appendTo(this.calendar().$body);
                this.$label.appendTo(this.calendar().$header);
            },

            /**
             * @private
             */
            _render = function () {
                var months = luxon.Info.months("short");

                for (let index in months) {
                    let $month = $("<div/>", {
                        "class": this.classes.item,
                        "text": months[index]
                    });

                    $month.appendTo(this.$wrapper).data("month", parseInt(index) + 1);
                }
            },

            /**
             * @param value
             * @private
             */
            _setLabel = function (value) {
                this.$label.text(value).addClass("changed");
            },

            /**
             * @private
             */
            _eventRemoveTransitionalClass = function () {
                this.$label.removeClass("changed");
            },

            /**
             * @private
             */
            _eventSelectMonth = function (event) {
                var $month = $(event.currentTarget);
                var month = $month.data("month");

                this.setMonth(this.calendar().yearPicker().getYear(), month).hide();
            },

            /**
             * @private
             */
            _bindEvent = function () {
                this.$label.on("click", this.calendar().yearPicker().show.bind(this.calendar().yearPicker(), undefined));

                this.$label.on("transitionend webkitTransitionEnd oTransitionEnd", _eventRemoveTransitionalClass.bind(this));

                this.$wrapper.on("click", this.classes.$("item"), _eventSelectMonth.bind(this));
            };

        /** Prototype of MonthPicker Class **/
        MonthPickerConstructor.prototype = {
            constructor: MonthPickerConstructor,

            classes: {
                wrapper: "mc-month-selector",
                showed: "mc-month-selector-showed",
                item: "mc-month-selector-item",
                selectedItem: "mc-month-selector-item-selected",
                label: "mc-month-selector-label",
                $: function (selector) {
                    return "." + this[selector]
                }
            },

            /**
             * @param {number} year
             * @returns {MonthPickerConstructor}
             */
            show: function (year) {
                if (typeof year !== "undefined") {
                    this.calendar().yearPicker().setYear(year);
                }

                this.calendar().$wrapper.addClass(this.classes.showed);

                return this;
            },

            /**
             * @returns {MonthPickerConstructor}
             */
            hide: function () {
                this.calendar().$wrapper.removeClass(this.classes.showed);

                return this;
            },

            /**
             * @returns {boolean}
             */
            isVisible: function () {
                return this.calendar().$wrapper.hasClass(this.classes.showed);
            },

            /**
             * @param {number} year
             * @returns {MonthPickerConstructor}
             */
            toggle: function (year) {
                if (this.isVisible()) {
                    return this.hide();
                }

                if (typeof year === "undefined") {
                    year = this.calendar().beginOfPeriod().year;
                }

                return this.show(year);
            },
        };

        return MonthPickerConstructor;
    })();

    var YearPicker = (function () {

        /** Constructor of YearPicker Class **/
        var YearPicker = function (calendar) {
            var _year,
                _range = {start: null, end: null};

            /**
             * @returns {Calendar}
             */
            this.calendar = function () {
                return calendar;
            };

            /**
             * @returns {Object}
             */
            this.getRange = function () {
                return _range;
            };

            /**
             * @param {number} year
             * @returns {YearPicker}
             */
            this.setYear = function (year) {
                _year = year;

                let monthPicker = this.calendar().monthPicker();

                this.getRange().start = year - this.getOffset();
                this.getRange().end = year + this.getOffset() - 1;

                _render.call(this);

                monthPicker.setMonth(year, monthPicker.getMonth());

                return this;
            };

            /**
             * @returns {number}
             */
            this.getYear = function () {
                return _year;
            };

            _elements.call(this);
            _build.call(this);
            _bindEvent.call(this);

            return this;
        };

        /** Private Method of YearPicker Class **/
        var
            /**
             * @private
             */
            _elements = function () {
                this.$wrapper = $("<div/>", {
                    "class": this.classes.wrapper
                });

                this.$label = $("<div/>", {
                    "class": this.classes.label
                });
            },

            /**
             * @private
             */
            _build = function () {
                this.$wrapper.appendTo(this.calendar().$body);
                this.$label.appendTo(this.calendar().$header);
            },

            /**
             * @private
             */
            _render = function () {
                this.$wrapper.empty();

                var range = this.getRange();

                for (let year = range.start; year <= range.end; year++) {
                    _renderYear.call(this, year).appendTo(this.$wrapper);
                }

                _setLabel.call(this, range);
            },

            /**
             * @param year
             * @returns {*|HTMLElement}
             */
            _renderYear = function (year) {
                var yearWidth = 25 / this.calendar().option("monthToDisplay");
                var $year = $("<div/>", {
                    "class": this.classes.item,
                    "text": year
                });

                if (this.calendar().beginOfPeriod().year === year) {
                    $year.addClass(this.classes.selectedItem);
                }

                $year.data("year", year).width(yearWidth + "%");

                return $year;
            },

            /**
             * @param range
             * @returns {YearPicker}
             */
            _setLabel = function (range) {
                range || (range = this.getRange());

                this.$label.text(range.start + " - " + range.end).removeClass('changed').addClass("changed");

                return this;
            },
            /**
             * @private
             */
            _bindEvent = function () {
                this.$label.on("transitionend webkitTransitionEnd oTransitionEnd", () => this.$label.removeClass("changed"));
                this.$wrapper.on("click", this.classes.$("item"), _eventSelectYear.bind(this));
            },

            /**
             * @private
             */
            _eventSelectYear = function (event) {
                var $year = $(event.currentTarget);

                this.setYear($year.data("year")).hide();
                this.calendar().monthPicker().show();
            };

        /** Prototype of YearPicker Class **/
        YearPicker.prototype = {
            constructor: YearPicker,

            classes: {
                wrapper: "mc-year-selector",
                showed: "mc-year-selector-showed",
                item: `mc-year-selector-item`,
                selectedItem: "mc-year-selector-item-selected",
                label: "mc-year-selector-label",
                $: function (selector) {
                    return "." + this[selector]
                }
            },

            /**
             * @returns {number}
             */
            getOffset: function () {
                return 8 * this.calendar().option("monthToDisplay");
            },

            /**
             * @returns {YearPicker}
             */
            next: function () {
                return this.setYear(this.getRange().end + this.getOffset() + 1);
            },

            /**
             * @returns {YearPicker}
             */
            prev: function () {
                return this.setYear(this.getRange().start - this.getOffset());
            },

            /**
             * @param year
             * @returns {YearPicker}
             */
            show: function (year) {
                if (typeof year !== "undefined") this.setYear(year);

                this.calendar().monthPicker().hide();
                this.calendar().$wrapper.addClass(this.classes.showed);

                return this;
            },

            /**
             * @returns {YearPicker}
             */
            hide: function () {
                this.calendar().$wrapper.removeClass(this.classes.showed);

                return this;
            },

            /**
             * @returns {*|boolean}
             */
            isVisible: function () {
                return this.calendar().$wrapper.hasClass(this.classes.showed);
            },

            /**
             * @returns {*}
             */
            toggle: function () {
                if (this.isVisible()) return this.hide();

                return this.show();
            },
        };

        return YearPicker;
    })();

    window.Calendar = (function () {

        /** Constructor of Calendar Class **/
        var CalendarConstructor = function (options) {
            var _options,
                _today,

                _yearPicker,
                _monthPicker,

                _beginOfPeriod,
                _endOfPeriod,

                _lastSelect,
                _rendered,

                _selections = [],
                _disables = [];

            /**
             * @returns {*}
             */
            this.today = function () {
                if (!_today) _today = this.normalizeDate(DateTime.local());

                return _today;
            };

            /**
             * @returns {YearPicker}
             */
            this.yearPicker = function () {
                if (!_yearPicker) _yearPicker = new YearPicker(this);

                return _yearPicker;
            };

            /**
             * @returns {MonthPicker}
             */
            this.monthPicker = function () {
                if (!_monthPicker) _monthPicker = new MonthPicker(this);

                return _monthPicker;
            };

            /**
             * @param key
             * @param defaultValue
             * @returns {*}
             */
            this.option = function (key, defaultValue) {
                if (typeof key !== "undefined") {
                    return typeof _options[key] !== "undefined" ? _options[key] : defaultValue;
                }

                return _options;
            };

            /**
             * @returns {Object}
             */
            this.beginOfPeriod = function () {
                return _beginOfPeriod;
            };

            /**
             * @returns {Object}
             */
            this.endOfPeriod = function () {
                return _endOfPeriod;
            };

            /**
             * @returns {Object}
             */
            this.lastSelect = function () {
                return _lastSelect;
            };

            /**
             * @returns {boolean}
             */
            this.isRendered = function () {
                return _rendered;
            };

            /**
             * @returns {Array}
             */
            this.selected = function () {
                return _selections;
            };

            /**
             * @returns {Array}
             */
            this.disabled = function () {
                return _disables;
            };

            /**
             * Select specific date/dates
             * @param date
             * @param fromDate
             * @param _rerenderDOM
             * @returns {*}
             */
            this.select = function (date, fromDate, _rerenderDOM) {
                if (fromDate) return this.selectInRange(date, fromDate);

                if (date instanceof Array) {
                    for (let index in date) this.select(date[index]);

                    return this;
                }

                date = this.normalizeDate(date);

                /** Skip if the date is disabled **/
                if (this.isDisabled(date)) return this;

                if (!this.isSelected(date)) {
                    /** Discard all selected dates before selecting new date if [[multiselect]] option set to [[false]] **/
                    if (!this.option("multiselect")) _selections = [];

                    _lastSelect = date;

                    _selections.push(date);
                }

                if (_rerenderDOM !== false) _loadSelectedDay.call(this);

                return this;
            };

            /**
             * Disable specific date/dates
             * @param date
             * @returns {CalendarConstructor}
             */
            this.disable = function (date) {
                if (date instanceof Array) {
                    for (let index in date) this.disable(date[index]);

                    return this;
                }

                date = this.normalizeDate(date);

                _disables.push(date);

                /** Unselect disabled date if it is currently selected **/
                this.unselect(date);

                /** Rerender the calendar **/
                if (this.isRendered()) this.render(this.beginOfPeriod());

                return this;
            };

            /**
             * Render calendar to specific date
             * @param date
             * @returns {CalendarConstructor}
             */
            this.render = function (date) {
                date = this.normalizeDate(date);

                this.$months.empty();

                _renderMonth.call(this, date);

                _beginOfPeriod = date;
                _endOfPeriod = date.plus({"month": this.option("monthToDisplay") - 1}).endOf("month").startOf("day");

                _setHeader.call(this);
                _loadSelectedDay.call(this);

                _rendered = true;

                return this;
            };

            /** Initialize options **/
            _options = $.extend({}, CalendarConstructor.defaults, options);

            /** The first step of long journey **/
            _elements.call(this);
            _build.call(this);
            _bindEvent.call(this);

            /** Initialize month and year selector **/
            this.monthPicker();
            this.yearPicker();

            /** Initialize Options **/
            this.disable(this.option("disables"));
            this.select(this.today());

            /** Set today as current period and render the calendar **/
            this.render(this.today());
            this.yearPicker().setYear(this.beginOfPeriod().year);

            return this;
        };

        /** Private Method of Calendar Class **/
        var
            /**
             * Define DOM of the [[Calendar]] class instance
             * @private
             */
            _elements = function () {
                this.$wrapper = $("<div/>", {
                    "class": "mc-wrapper"
                });

                this.$header = $("<div/>", {
                    "class": "mc-header"
                });

                this.$monthYearDisplay = $("<div/>", {
                    "class": "mc-month-year-display-wrapper"
                });

                this.$monthYear = $("<div/>", {
                    "class": "mc-month-year-display"
                });

                this.$month = $("<div/>", {
                    "class": "mc-month-display"
                });

                this.$year = $("<div/>", {
                    "class": "mc-year-display"
                });

                this.$monthYearEnd = $("<div/>", {
                    "class": "mc-month-year-display"
                });

                this.$monthEnd = $("<div/>", {
                    "class": "mc-month-display"
                });

                this.$yearEnd = $("<div/>", {
                    "class": "mc-year-display"
                });

                this.$body = $("<div/>", {
                    "class": "mc-body"
                });

                this.$months = $("<div/>", {
                    "class": "mc-months"
                });

                this.$footer = $("<div/>", {
                    "class": "mc-footer"
                });

                this.$next = $("<div/>", {
                    "class": "mc-next",
                });

                this.$prev = $("<div/>", {
                    "class": "mc-prev",
                });

                this.$today = $("<div/>", {
                    "class": "mc-selected",
                });

                this.$toolbar = $("<div/>", {
                    "class": "mc-toolbar"
                });
            },

            /**
             * Build DOM Structure for calendar
             * @private
             */
            _build = function () {
                this.$wrapper.data("Calendar", this);

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

                this.$monthYearEnd
                    .append(this.$monthEnd)
                    .append(this.$yearEnd)
                    .insertAfter(this.$monthYear)
                    .toggle(this.option("monthToDisplay") > 1);
            },

            /**
             * Handle scroll navigation
             * This event trigerred when user scroll the mouse wheel over the calendar
             * @returns false
             * @private
             */
            _eventNavigateOnScroll = function (event) {
                var isScrollUp = event.originalEvent.wheelDelta > 0;

                if (isScrollUp) this.prev();
                else this.next();

                return false;
            },

            /**
             * Handle select in range event
             * This event trigerred when user press shift key when hovering over calendar
             * @param event
             * @private
             */
            _eventToggleSelectInRange = function (event) {
                if (!event.shiftKey || !this.lastSelect()) {
                    _finishSelectInRange.call(this);
                } else {
                    let date = $(event.currentTarget).data("date");

                    _startSelectInRange.call(this, date);
                }
            },

            /**
             * Handle select date event
             * This event trigerred when user click on specific date on calendar
             * @param event
             * @private
             */
            _eventToggleSelectDate = function (event) {
                var date = $(event.currentTarget).data("date");
                var dateFrom = event.shiftKey && this.lastSelect() ? this.lastSelect() : false;

                this.toggleSelect(date, dateFrom);
            },

            /**
             * Bind events to the calendar"s DOM
             * @private
             */
            _bindEvent = function () {
                /** Navigation Event **/
                this.$next.on("click", this.next.bind(this));
                this.$prev.on("click", this.prev.bind(this));
                this.$today.on("click", this.home.bind(this));
                this.$body.on("mousewheel", _eventNavigateOnScroll.bind(this));

                /** Month Selector Event **/
                this.$monthYearDisplay.on("click", this.monthPicker().toggle.bind(this.monthPicker(), undefined));

                /** Select in Range Event **/
                this.$wrapper.on("mouseleave", _finishSelectInRange.bind(this));
                this.$wrapper.on("mouseover", ".mc-day-wrapper", _eventToggleSelectInRange.bind(this));

                /** Select Date Event **/
                this.$wrapper.on("click", ".mc-day-wrapper", _eventToggleSelectDate.bind(this));
            },

            /**
             * Render DOM structure of week
             * @returns {HTMLElement}
             * @private
             */
            _renderWeek = function () {
                var $week = $("<div/>", {
                    "class": "mc-week"
                });

                if (typeof this.option("weekCallback") === "function") {
                    this.option("weekCallback").call(this, $week);
                }

                return $week;
            },

            /**
             * Set the header
             * @private
             */
            _setHeader = function () {
                this.$year.text(this.beginOfPeriod().year);
                this.$month.text(this.beginOfPeriod().monthLong);

                if (this.option("monthToDisplay") > 1) {
                    this.$yearEnd.text(this.endOfPeriod().year);
                    this.$monthEnd.text(this.endOfPeriod().monthLong);
                }
            },

            /**
             * Render DOM structure of single day
             * @param date
             * @param currentDate
             * @returns {HTMLElement}
             * @private
             */
            _renderDay = function (date, currentDate) {
                var $dayWrapper = $("<div/>", {
                    "class": "mc-day-wrapper"
                });
                var $day = $("<div/>", {
                    "class": "mc-day"
                });

                if (date.month < currentDate.month) {
                    $dayWrapper.addClass("mc-day-prev-month");
                } else if (date.month > currentDate.month) {
                    $dayWrapper.addClass("mc-day-next-month");
                } else {
                    $dayWrapper.addClass("mc-day-current-month");
                }

                if (this.isDisabled(date)) $dayWrapper.addClass("mc-day-disabled");

                if (this.isToday(date)) $dayWrapper.addClass("mc-day-today");

                $day.text(date.day).appendTo($dayWrapper);

                if (typeof this.option("dayCallback") === "function") {
                    this.option("dayCallback").call(this, date, $dayWrapper);
                }

                $dayWrapper.data("date", date);

                return $dayWrapper;
            },

            /**
             * Render DOM structure of month header
             * @param date
             * @param {boolean} monthName
             * @returns {HTMLElement}
             * @private
             */
            _renderMonthHeader = function (date, monthName) {
                var weeks = luxon.Info.weekdays("narrow");
                var first = weeks.slice(this.option("firstDay") - 1);
                var last = weeks.slice(0, this.option("firstDay") - 1);
                var $dayNames = $("<div/>", {
                    "class": "mc-day-names",
                });

                for (let index in first.concat(last)) {
                    let $dayName = $("<div/>", {
                        "class": "mc-day-name",
                        "text": weeks[index]
                    });

                    $dayNames.append($dayName);
                }

                if (monthName) {
                    let $monthName = $("<div/>", {
                        "class": "mill-call-month-name",
                        "text": date.monthLong + " " + date.year
                    });

                    return $monthName.add($dayNames)
                }

                return $dayNames;
            },

            /**
             * Render DOM Structure of month
             * @param date
             * @returns {HTMLElement}
             * @private
             */
            _renderMonth = function (date) {
                var start = date.startOf("month");
                var end = date.endOf("month");
                var displayMonthName = this.option("monthToDisplay") > 1;
                var $days = $();
                var $month = $("<div/>", {"class": "mc-month"});
                var $header = _renderMonthHeader.call(this, date, displayMonthName);

                $month.append($header);

                /** Calculate how many day calendar should display date of the previous month **/
                if (start.weekday !== this.option("firstDay")) {
                    let remain = start.weekday - this.option("firstDay");

                    if (remain < 0) remain = (7 - Math.abs(remain));

                    start = start.minus({"day": Math.abs(remain)});
                }

                while (start <= end || start.weekday !== this.option("firstDay")) {
                    $days = $days.add(_renderDay.call(this, start, date));

                    if ($days.length === 7) {
                        _renderWeek.call(this).append($days).appendTo($month);
                        $days = $();
                    }

                    start = start.plus({"day": 1});
                }

                if (typeof this.option("monthCallback") === "function") {
                    this.option("monthCallback").call(this, start, end, $month);
                }

                this.$months.append($month);

                /** If option [[monthToDisplay]] set more than one, then render the remaining month **/
                if (this.$months.find(".mc-month").length < this.option("monthToDisplay")) {
                    _renderMonth.call(this, date.plus({"month": 1}));
                }

                return $month;
            },

            /**
             * @private
             */
            _finishSelectInRange = function () {
                if (this.isSelectInRange()) {
                    this.$wrapper.removeClass("mc-month-select-in-range");
                    this.$wrapper.find(".mc-day-over:not(.mc-day-disabled)").removeClass("mc-day-over-first mc-day-over-last mc-day-over");
                }
            },

            /**
             * @param date
             * @private
             */
            _startSelectInRange = function (date) {
                _finishSelectInRange.call(this);

                var $lastOver = false;
                var $days = this.$body.find(".mc-day-wrapper");
                var self = this;
                var isRight = this.lastSelect() <= date;

                $days.removeClass("mc-day-over-first mc-day-over-last mc-day-over");

                $days.not(".mc-day-disabled").filter(function () {
                    var _date = $(this).data("date");

                    if (isRight) {
                        return _date >= self.lastSelect() && _date <= date;
                    }

                    return _date <= self.lastSelect() && _date >= date;
                }).addClass("mc-day-over");

                $days.each(function () {
                    var $this = $(this);
                    var isOver = $this.hasClass("mc-day-over");

                    if (isOver && $lastOver === false) {
                        $this.addClass("mc-day-over-first");
                    } else if (!isOver && $lastOver) {
                        $lastOver.addClass("mc-day-over-last");
                        $lastOver = false
                    }

                    if (isOver) ($lastOver = $this);
                });

                this.$wrapper.addClass("mc-month-select-in-range");
            },

            /**
             * @private
             */
            _loadSelectedDay = function () {
                if (!this.selected()) return;

                var self = this;
                var $lastSelected = false;
                var $days = this.$body.find(".mc-day-wrapper");

                $days.removeClass("mc-day-selected-first mc-day-selected-last mc-day-selected");

                $days.filter(function () {
                    var date = $(this).data("date");

                    return self.isSelected(date);
                }).addClass("mc-day-selected");

                $days.each(function () {
                    var $this = $(this);
                    var isSelected = $this.hasClass("mc-day-selected");

                    if (isSelected && $lastSelected === false) {
                        $this.addClass("mc-day-selected-first");
                    } else if (!isSelected && $lastSelected) {
                        $lastSelected.addClass("mc-day-selected-last");
                        $lastSelected = false
                    }

                    if (isSelected) $lastSelected = $this;
                })
            };

        /** Prototype of Calendar Class **/
        CalendarConstructor.prototype = {
            constructor: CalendarConstructor,

            /**
             * @returns {CalendarConstructor}
             */
            home: function () {
                if (this.yearPicker().isVisible() || this.monthPicker().isVisible()) {
                    this.yearPicker().setYear(this.beginOfPeriod().year);
                } else {
                    this.render(this.today());
                }

                return this;
            },

            /**
             * @returns {CalendarConstructor}
             */
            prev: function () {
                if (this.yearPicker().isVisible()) {
                    this.yearPicker().prev();
                } else if (this.monthPicker().isVisible()) {
                    this.yearPicker().setYear(this.yearPicker().getYear() - 1);
                } else {
                    this.render(this.beginOfPeriod().minus({"month": 1}));
                }

                return this;
            },

            /**
             * @returns {CalendarConstructor}
             */
            next: function () {
                if (this.yearPicker().isVisible()) {
                    this.yearPicker().next();
                } else if (this.monthPicker().isVisible()) {
                    this.yearPicker().setYear(this.yearPicker().getYear() + 1);
                } else {
                    this.render(this.beginOfPeriod().plus({"month": 1}));
                }

                return this;
            },

            /**
             * Check whether the given date is selected or not
             * @param date
             * @returns {boolean}
             */
            isSelected: function (date) {
                date = this.normalizeDate(date);

                return this.selected().map(selection => selection.ts).indexOf(date.ts) > -1;
            },

            /**
             * @param date
             * @returns {CalendarConstructor}
             */
            unselect: function (date) {
                if (date instanceof Array) {
                    for (let index in date) this.unselect(date[index]);

                    return this;
                }

                if (!this.option("allowEmpty") && this.selected().length === 1) return this;

                date = this.normalizeDate(date);

                var selectionIndex = this.selected().map(selection => selection.ts).indexOf(date.ts);

                if (selectionIndex === -1) return this;

                this.selected().splice(selectionIndex, 1);
                _loadSelectedDay.call(this);

                return this;
            },

            /**
             * @param startDate
             * @param fromDate
             * @returns {CalendarConstructor}
             */
            selectInRange: function (startDate, fromDate) {
                fromDate = this.normalizeDate(fromDate);

                let isLeft = fromDate < startDate;

                this.select(startDate, null, false);

                while ((isLeft && startDate > fromDate) || (!isLeft && startDate < fromDate)) {
                    let modifier = isLeft ? "minus" : "plus";

                    startDate = startDate[modifier]({day: 1});

                    this.select(startDate, null, false);
                }

                _loadSelectedDay.call(this);

                return this;
            },

            /**
             * @returns {CalendarConstructor}
             */
            clearSelection: function () {
                var minimumInput = this.option("allowEmpty") ? 0 : 1;

                while (this.selected().length > minimumInput) {
                    this.unselect(this.selected()[0]);
                }

                return this;
            },

            /**
             * @param date
             * @param fromDatetime
             * @returns {CalendarConstructor}
             */
            toggleSelect: function (date, fromDatetime) {
                date = this.normalizeDate(date);

                if (fromDatetime || !this.isSelected(date)) {
                    return this.select(date, fromDatetime);
                }

                return this.unselect(date);
            },

            /**
             * Check whether the given date is disabled or not
             * @param date
             * @returns {boolean}
             */
            isDisabled: function (date) {
                date = this.normalizeDate(date);

                return this.disabled().map(disable => disable.ts).indexOf(date.ts) > -1;
            },

            /**
             * Check whether the given date is today or not
             * @param date
             * @returns {boolean}
             */
            isToday: function (date) {
                date = this.normalizeDate(date);

                return this.today().hasSame(date, "day");
            },

            /**
             * @returns {boolean}
             */
            isSelectInRange: function () {
                return this.$wrapper.hasClass("mc-month-select-in-range");
            },

            /**
             * Get formatted version of selected date
             * @param {boolean} formatted return luxon object if set to [[false]]
             * @returns {Array|string}
             */
            value: function (formatted) {
                var selections = this.selected();

                if (formatted || typeof formatted === "undefined") {
                    selections = this.map(selections);
                }

                return this.option("multiselect") ? selections : selections[0]
            },

            /**
             * @param dates
             * @returns {Array}
             */
            map: function (dates) {
                dates = this.normalizeDate(dates);

                return dates.map(date => date.toFormat(this.option("format")));
            },

            /**
             * @param dates
             * @returns {*}
             */
            normalizeDate: function (dates) {
                if (dates instanceof Array) {
                    return dates.map(date => this.normalizeDate(date));
                }

                var result = null;

                if (typeof dates === "object" && typeof dates.c !== "object") {
                    if (dates instanceof Date) {
                        result = DateTime.fromJSDate(dates);
                    } else {
                        result = DateTime.fromObject(dates);
                    }
                } else {
                    result = DateTime.fromFormat(this.option("format"), dates);
                }

                return result.startOf("day");
            },
        };

        /** Defaults Options of Calendar Class **/
        CalendarConstructor.defaults = {
            "format": "MMMM dd yyyy, h:mm:ss a",
            "min": null,
            "max": null,
            "dayCallback": $.noop,
            "weekCallback": $.noop,
            "monthCallback": $.noop,
            "onSelect": $.noop,
            "firstDay": 7,
            "multiselect": true,
            "monthToDisplay": 1,
            "allowEmpty": false,
            "dateRange": true,
            "disables": []
        };

        return CalendarConstructor;
    })();


    var Millennial = function ($element, options) {
        var _options = $.extend({}, this.defaults, options);

        this.option = function (key, defaultValue) {
            if (typeof key !== "undefined") {
                return typeof _options[key] !== "undefined" ? _options[key] : defaultValue;
            }

            return _options;
        };
    };

    $.fn.millennial = function (first, second) {
        var millennial = this.data("stick");

        if (millennial) {
            if (typeof millennial[first] === "function") {
                return millennial[first](second);
            }

            return false;
        } else {
            millennial = new Millennial(this, first);

            this.data("stick", millennial);
        }

        return this;
    }

})(jQuery);