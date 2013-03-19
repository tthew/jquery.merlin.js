//     jquery.merlin.js

//     (c) 2013 Matt Richards, Lucidmoon Ltd
//     jquery.merlin.js may be freely distributed under the MIT license.
//     http://lucidmoon.co.uk

(function($) {

    // Initial Setup
    // -------------
    var settings;

    // Namespace
    var Merlin = function(el) {
        var $steps,
            currentStep = 0;

        // show specified step
        var showStep = function(stepNumber) {
            currentStep = stepNumber;
            $($steps[stepNumber]).show(function() {
                $(this).parents('form').removeClass (function (index, className) {
                    return (className.match (/\bstep\d+/g) || []).join(' ');
                }).addClass("step" + currentStep);       
            });            
        }

        // Hide all steps
        var hideSteps = function() {
            $('.step', el).hide();
        }

        // Hide a specified step
        var hideStep = function(stepNumber) {
            $($steps[stepNumber]).hide();            
        }

        // Show the current step
        var showCurrentStep = function() {
            showStep(currentStep);
        }

        // Hide the current step
        var hideCurrentStep = function() {
            hideStep(currentStep);
        }

        // Show the next step
        var showNextStep = function() {
            hideCurrentStep();
            currentStep++;
            showStep(currentStep);
            
        }
        
        // Show the previous step
        var showPreviousStep = function() {
            hideCurrentStep();
            currentStep--;
            showStep(currentStep);
            
        }

        // Show Review step
        var showReview = function() {

            
            $(el).removeClass(function (index, className) {
                console.log((className.match (/\bstep\d+/g) || []).join(' '));
                return (className.match (/\bstep\d+/g) || []).join(' ');
            }).addClass("review");       

            $step = $('<div class="step review"></div>');
            $fields = $('input.merlin, textarea.merlin, select.merlin', el);
            console.log($fields);
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
            $backButton = $('<button class="btn"><i class="icon-chevron-left"></i> Back</button>').click(function(e) {
                e.preventDefault();
                $(el).removeClass('review');
                $step.hide();
                showCurrentStep();
            });
            $step.append($ul);
            $step.append($backButton);
            hideCurrentStep();
            $step.hide();
            $(el).append($step.show());
        }

        // run validators on specified step and return boolean 
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

        // Configure buttons for specific step
        var configureButtons = function(step) {
            var stepNumber = $.inArray(step, $steps);
            $(step).append('<div class="buttons btn-group"></div>');
            // Check we have a valid step number
            // REFACTOR
            if (stepNumber > -1) {
                // Check whether the next step exists
                if ($steps[stepNumber + 1]) {
                    var $button = $('<button class="btn">Next <i class="icon-chevron-right"></i></button>').click(function(e) {
                        e.preventDefault();

                        if (isValid(step)) {
                            showNextStep();
                        }                        
                    });
                    $(settings.buttonWellTarget).append($button)
                }

                // Check whether the previous step exists
                if ($steps[stepNumber - 1]) {
                    var $button = $('<button class="btn btn-secondary"><i class="icon-chevron-left"></i> Previous</button>').click(function(e) {
                        e.preventDefault();
                        showPreviousStep();
                    });
                    $(settings.buttonWellTarget).prepend($button)
                }
            }
            
            // Check that previous step exists
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

                $(settings.buttonWellTarget).append($reviewButton)
            }
        };


        // Return public API
        return {
            // Initialise instance
            init: function() {
                // add namespace className to target element.
                $(el).addClass('lm-merlin');
                // Get steps
                try {
                    $steps = $('.step', el);
                    if (!$steps.length) {
                        throw new Error("No steps found");
                    }
                } catch (e) {
                    console.error(e.message);
                    return false;
                }
                
                // Iterate through each step and configure buttons
                $steps.each(function() {
                    configureButtons(this);
                    $(this).hide();
                });
                
                // Setup progress bar and inject into DOM.
                var $ul = $('<ul class="lm-merlin-progress"></ul>');
                for (var i=0; i < $steps.length; i++) {
                    var $li = $('<li  data-step="'+ i +'" class="step' + i + '">Step ' + (i + 1) + '</li>');
                    $li.click(function() {
                        // if destination step number is less than current step number skip validation, otherwise validate first.
                        if (($(this).data('step') < currentStep) || isValid($steps[currentStep])) {
                            hideSteps();
                            showStep($(this).data('step'));    
                        }                       
                    });
                    $ul.append($li);
                }
                $ul.append('<li class="review">Review</li>');
                $(el).prepend($ul);
                showCurrentStep();
            }
        }
    };

     $.fn.merlin = function(options) {
        var self = this;
        settings = $.extend({
            buttonWellTarget: '.buttons',
            progressIndicatorTarget: '.modal-header'
        }, options);

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