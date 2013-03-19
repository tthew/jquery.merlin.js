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
        var $form,
            $steps,
            $submitButton,
            buttons,
            currentStep = 0;

        // show specified step
        var showStep = function() {
            $($steps[currentStep]).show(function() {
                $(el).removeClass('complete, review').removeClass(function (index, className) {
                    return (className.match (/\bstep\d+/g) || []).join(' ');
                }).addClass("step" + currentStep);       
            });           
            buttons.draw(); 
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
            hideSteps();
            currentStep++;
            showStep();
        }
        
        // Show the previous step
        var showPreviousStep = function() {
            hideSteps();
            currentStep--;
            showStep();
            
        }

        // Show Review step
        var showReview = function() {

            $(el).removeClass(function (index, className) {
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
         
            $step.append($ul);
         
            hideCurrentStep();
            $step.hide();
            $(settings.stepsTargetSelector, el).append($step.show());
            buttons.draw();
            currentStep++;
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

        var progressIndicatorController = function() {
            
            var _init = function() {
                // Setup progress bar and inject into DOM.
                var $ul = $('<ul class="lm-merlin-progress"></ul>');
                for (var i=0; i < $steps.length; i++) {

                    var $li = $('<li  data-step="'+ i +'" class="step' + i + '">Step ' + (i + 1) + '</li>');
                    // $li.click(function() {
                    //     // if destination step number is less than current step number skip validation, otherwise validate first.
                    //     console.log($(this).data('step') + '<' + currentStep)
                    //     if ($(this).data('step') < currentStep) {
                    //         hideSteps();
                    //         currentStep = $(this).data('step');
                    //         showStep($(this).data('step'));    
                    //     } else if (isValid($steps[currentStep])) {
                    //         hideSteps();
                    //         currentStep = $(this).data('step');
                    //         showStep();     
                    //     }                       
                    // });
                    $ul.append($li);
                }
                $ul.append('<li class="review">Review</li><li class="complete">Complete</li>');
                $(settings.progressIndicatorTargetSelector, el).append($ul);   
            }

            var _draw = function() {

            }

            return {
                draw: _draw,
                init: _init
            }
        }

        var buttonController = function() {

            var $previousButton = $('<button class="btn"><i class="icon-chevron-left"></i> Back</button>').click(function(e) {
                e.preventDefault();
                showPreviousStep();
            });

            var $nextButton = $('<button class="btn">Next <i class="icon-chevron-right"></i></button>').click(function(e) {
                e.preventDefault();
                if (isValid($steps[currentStep])) {
                    showNextStep();
                }                        
            });

            var $reviewButton = $('<button class="btn">Review <i class="icon-chevron-right"></i></button>').click(function(e) {
                e.preventDefault();
                showReview();
            });

            var $doneButton = $('<button class="btn">Done</button>').click(function(e) {
                e.preventDefault();
                // showReview();
            });

            // Clone submit button & remove original from dom
            var $submitButton = $('.submit', el).clone();
            $('.submit', el).remove();

            $submitButton.click(function() {
                hideSteps();
                $(el).removeClass('review').addClass('complete');
                buttons.draw();
            });

            var _draw = function() {
                // Hide buttons
                $previousButton.hide();
                $nextButton.hide();
                $reviewButton.hide();
                $submitButton.hide();
                $doneButton.hide();

                var complete = $(el).hasClass('complete');

                
                if ( complete ) {
                    // If process is complete, show done button
                    $doneButton.show();    
                } else {
                    // Check whether the next step exists & show next button
                    if ($steps[currentStep + 1]) {
                        $nextButton.show();    
                    } else {
                        if ($(el).hasClass('review')) {
                            $submitButton.show();
                        } else {
                            $reviewButton.show();   
                        }
                         
                    }

                    // Check whether the previous step exists & show previous button
                    if ($steps[currentStep - 1]) {
                        $previousButton.show();   
                    }            
                }
            }

            var _init = function() {
                $(settings.buttonGroupTargetSelector).append([
                    $previousButton,
                    $nextButton,
                    $reviewButton,
                    $submitButton,
                    $doneButton
                ]);

                _draw();

            }

            return {
                init: _init,
                draw: _draw
            };
        }

        var _init = function() {
            // Check for FORM element
            var $forms = $(el).find('form');
            
            if ($forms.length === 0) {
                throw new Error('No form found :(');
            }

            $form = $forms[0];

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
                $(this).hide();
            });

            buttons = buttonController();
            buttons.init();
            
            progressIndicator = progressIndicatorController();
            progressIndicator.init();

            showCurrentStep();
        }

        // Return public API
        return {
            // Initialise instance
            init: _init
        }
    };

     $.fn.merlin = function(options) {
        var self = this;
        settings = $.extend({
            buttonGroupTargetSelector: '.buttons',
            progressIndicatorTargetSelector: '.modal-header'
        }, options);

        $(this).each(function() {
            try {                
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