(function($) {

    // Shim console so it doesn't break older browsers
    var debug = false;

    if (!debug) {

    }
    // var console = window.console || {log:function(){}, error:function(){}};

    var Merlin = function($el) {
        var $steps,
            currentStep = 0;

        // var _panel = {
        //     isValid: function() {
        //         return false;
        //     },
        //     show: function() {
        //         console.log('show');
        //         $(this).show();
        //         $(this).parents('form').removeClass (function (index, className) {
        //             return (className.match (/\bstep\d+/g) || []).join(' ');
        //         }).addClass("step" + currentStep);                
        //         // $(this).parents("form");

        //         // removeClass("step" + currentStep).addClass("step" + (currentStep + 1));
        //     }
        // }
        // 
        
        var showStep = function(stepNumber) {
            $($steps[stepNumber]).show(function() {
                $(this).parents('form').removeClass (function (index, className) {
                    return (className.match (/\bstep\d+/g) || []).join(' ');
                }).addClass("step" + currentStep);       
            });            
        }

        var hideStep = function(stepNumber) {
            $($steps[stepNumber]).hide();            
        }

        var showCurrentStep = function() {
            showStep(currentStep);
        };

        var hideCurrentStep = function() {
            hideStep(currentStep);
        };

        var showNextStep = function() {
            hideCurrentStep();
            currentStep++;
            showStep(currentStep);
            
        }

        var showPreviousStep = function() {
            hideCurrentStep();
            currentStep--;
            showStep(currentStep);
            
        }

        var configureButtons = function(step) {
            var stepNumber = $.inArray(step, $steps);
            $(step).append('<div class="buttons btn-group"></div>');
            if (stepNumber > -1) {
                if ($steps[stepNumber + 1]) {
                    var $button = $('<button class="btn">Next <i class="icon-chevron-right"></i></button>').click(function(e) {
                        console.log(this);
                        e.preventDefault();
                        showNextStep();
                    });
                    $('.buttons',step).append($button)
                }

                if ($steps[stepNumber - 1]) {
                    var $button = $('<button class="btn btn-secondary"><i class="icon-chevron-left"></i> Previous</button>').click(function(e) {
                        console.log(this);
                        e.preventDefault();
                        showPreviousStep();
                    });
                    $('.buttons',step).prepend($button)
                }
            }
            
            if (stepNumber == ($steps.length - 1)) {

                var $reviewButton = $('<button class="btn btn-primary">Review <i class="icon-chevron-right icon-white"></i></button>');

                // Show Review Step
                var $submit = $('.submit', $el).clone();
                $('.submit', $el).hide();
                $reviewButton.click(function(e) {
                    e.preventDefault();
                    
                });
                $('.buttons',step).append($reviewButton)
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
                
                $steps.each(function() {
                    configureButtons(this);
                    $(this).hide();
                });
                
                var $ul = $('<ul class="lm-merlin-progress"></ul>');
                for (var i=0; i < $steps.length; i++) {
                    var $li = '<li class="step' + i + '">Step ' + i + '</li>';
                    $ul.append($li);
                }
                $($el).prepend($ul);
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