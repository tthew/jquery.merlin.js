(function($) {

    // Shim console so it doesn't break older browsers
    var debug = false;

    if (!debug) {

    }
    // var console = window.console || {log:function(){}, error:function(){}};

    var Merlin = function(el) {
        var $steps,
            currentStep = 0;

        var showStep = function(stepNumber) {
            currentStep = stepNumber;
            $($steps[stepNumber]).show(function() {
                $(this).parents('form').removeClass (function (index, className) {
                    return (className.match (/\bstep\d+/g) || []).join(' ');
                }).addClass("step" + currentStep);       
            });            
        }

        var hideSteps = function() {
            $('.step', el).hide();
        }

        var hideStep = function(stepNumber) {
            $($steps[stepNumber]).hide();            
        }

        var showCurrentStep = function() {
            showStep(currentStep);
        }

        var hideCurrentStep = function() {
            hideStep(currentStep);
        }

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

        var showReview = function() {
            $step = $('<div class="step review"></div>');
            $fields = $('input, select, textarea', el);
            var $ul = $("<ol></ol>");
            $fields.each(function() {
                console.log(this);
                var $li = $("<li></li>");
                $h5 = $("<h5>" + $('label[for=' + $(this).attr('id')  + ']', el).text() + "</h5>");
                $p = $("<p>" + $(this).val() + "</p>");
                $li.append($h5);
                $li.append($p);
                $ul.append($li);
            });

            $step.append($ul);
            hideCurrentStep();
            $step.hide();
            $(el).append($step.show());
            
            

        }

        var isValid = function(step) {
            var validationErrors = [];
            var $requiredFields = $('input.required,textarea.required,select.required',step);
            $('p.error', step).remove();
            $requiredFields.each(function() {
                if ($(this).val() === "") {
                    validationErrors.push({
                        message: 'This field is required'
                    });

                    $(this, step).addClass('error').after('<p class="hint error">This field is required</p>');
                }
            });
            
            return validationErrors.length > 0 ? false : true;
        }

        var configureButtons = function(step) {
            var stepNumber = $.inArray(step, $steps);
            $(step).append('<div class="buttons btn-group"></div>');
            if (stepNumber > -1) {
                if ($steps[stepNumber + 1]) {
                    var $button = $('<button class="btn">Next <i class="icon-chevron-right"></i></button>').click(function(e) {
                        e.preventDefault();
                        

                        if (isValid(step)) {
                            showNextStep();
                        }
                        
                    });
                    $('.buttons',step).append($button)
                }

                if ($steps[stepNumber - 1]) {
                    var $button = $('<button class="btn btn-secondary"><i class="icon-chevron-left"></i> Previous</button>').click(function(e) {
                        e.preventDefault();
                        showPreviousStep();
                    });
                    $('.buttons',step).prepend($button)
                }
            }
            
            if (stepNumber == ($steps.length - 1)) {

                var $reviewButton = $('<button class="btn btn-primary">Review <i class="icon-chevron-right icon-white"></i></button>');

                // Show Review Step
                var $submit = $('.submit', el).clone();
                $('.submit', el).hide();
                $reviewButton.click(function(e) {
                    e.preventDefault();
                    if (isValid(step)) {
                        showReview();
                    }
                    
                });
                $('.buttons',step).append($reviewButton)
            }
        };

        return {
            init: function() {
                $(el).addClass('lm-merlin');
                try {
                    $steps = $('.step', el);
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
                    var $li = $('<li  data-step="'+ i +'" class="step' + i + '">Step ' + (i + 1) + '</li>');
                    $li.click(function() {
                        

                        // if ($(this).data('step') < currentStep) {

                        // }

                        if (($(this).data('step') < currentStep) || isValid($steps[currentStep])) {
                            hideSteps();
                            showStep($(this).data('step'));    
                        }
                        
                    });
                    $ul.append($li);
                }
                $ul.append('<li>Complete</li>');
                $(el).prepend($ul);
                showCurrentStep();
            }
        }
    };

     $.fn.merlin = function(options) {
        var self = this;
        var settings = $.extend({}, options);

        $(this).each(function() {
            try {
                // Check for FORM element
                $form = $(this).find('form');
                if ($form.length === 0) {
                    throw new Error('No form found :(');
                }

                // Create new instance of merlin
                var instance = new Merlin($form[0]);
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