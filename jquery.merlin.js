(function($) {

    // Shim console so it doesn't break older browsers
    var debug = false;

    if (!debug) {

    }
    // var console = window.console || {log:function(){}, error:function(){}};

    var Merlin = function($el) {
        var $steps,
            currentStep = 0;

        var _panel = {
            isValid: function() {
                return false;
            },
            show: function() {
                $(this).show();
            }
        }

        var showCurrentStep = function() {
            $($steps[currentStep]).show();
        };

        var hideCurrentStep = function() {
            $($steps[currentStep]).hide();
        };

        var showNextStep = function() {
            hideCurrentStep();
            $($steps[currentStep + 1]).show();
            currentStep++;
        }

        var showPreviousStep = function() {
            hideCurrentStep();
            $($steps[currentStep - 1]).show();
            currentStep--;
        }

        var configureButtons = function(step) {
            var stepNumber = $.inArray(step, $steps);
            $(step).append('<div class="buttons"></div>');
            if (stepNumber > -1) {
                if ($steps[stepNumber + 1]) {
                    var $button = $('<button class="btn btn-primary">Next</button>').click(function(e) {
                        console.log(this);
                        e.preventDefault();
                        showNextStep();
                    });
                    $('.buttons',step).append($button)
                }

                if ($steps[stepNumber - 1]) {
                    var $button = $('<button class="btn btn-secondary">Previous</button>').click(function(e) {
                        console.log(this);
                        e.preventDefault();
                        showPreviousStep();
                    });
                    $('.buttons',step).prepend($button)
                }
            }
            console.log(stepNumber + " " + $steps.length);
            if (stepNumber == ($steps.length - 1)) {
                var $button = $('<button class="btn btn-success">Request a Quote!</button>').click(function(e) {
                    console.log(this);
                    e.preventDefault();
                    showPreviousStep();
                });
                $('.buttons',step).append($button)
            }
        };

        return {
            init: function() {
                $($el).addClass('lm-merlin');
                try {
                    $steps = $('.step', $el);
                    if (!$steps.length) {
                        throw new Error("No steps found");
                    }
                } catch (e) {
                    console.error(e.message);
                    return false;
                }

                console.log('Found ' + $steps.length + ' step' + ($steps.length>1?'s':''));
                
                $steps.each(function() {
                    
                    this.isValid = _panel.isValid.call(this);
                    this.show = _panel.show.call(this);
                    configureButtons(this);

                    $(this).hide();
                });
                
                $('.submit',$el).hide();
                showCurrentStep();

            },
            next: function() {
                if ($steps[currentStep].isValid()) {
                    console.log('is valid');
                }
            },
            previous: function() {

            },
            submit: function() {

            }
        }
    };

     $.fn.merlin = function(options) {
        var self = this;
        var settings = $.extend({}, options);

        $(this).each(function() {
            try {
                // Check for FORM element
                if (this.tagName != 'FORM') {
                    throw new Error('What kind of wizardry is this? Merlin only works with FORM elements.');
                }

                // Create new instance of merlin
                var instance = new Merlin(this);
                // Initialise new instance
                instance.init();

                return this;
            } catch (e) {
                console.error(e.message);    
                return false;
            }
        });
    }
})(jQuery);