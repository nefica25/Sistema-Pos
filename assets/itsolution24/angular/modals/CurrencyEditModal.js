    window.angularApp.factory("CurrencyEditModal", ["API_URL", "window", "jQuery", "$http", "$uibModal", "$sce", "$rootScope", function (API_URL, window, $, $http, $uibModal, $sce, $scope) {
        return function(currency) {
            var currencyId;
            var uibModalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: "modal-title",
                ariaDescribedBy: "modal-body",
                template: "<div class=\"modal-header\">" +
                                "<button ng-click=\"closeCurrencyEditModal();\" type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>" +
                               "<h3 class=\"modal-title\" id=\"modal-title\"><span class=\"fa fa-fw fa-pencil\"></span> {{ modal_title }}</h3>" +
                            "</div>" +
                            "<div class=\"modal-body\" id=\"modal-body\">" +
                                "<div bind-html-compile=\"rawHtml\">Loading...</div>" +
                            "</div>",
                controller: function ($scope, $uibModalInstance) {
                    $http({
                      url: API_URL + "/_inc/currency.php?currency_id=" + currency.currency_id + "&action_type=EDIT",
                      method: "GET"
                    })
                    .then(function(response, status, headers, config) {
                        $scope.modal_title = currency.title;
                        $scope.rawHtml = $sce.trustAsHtml(response.data);

                        setTimeout(function() {
                            window.storeApp.select2();
                        }, 100);

                    }, function(response) {
                        window.swal("Oops!", response.data.errorMsg, "error")
                        .then(function() {
                            $scope.closeCurrencyEditModal();
                        });
                    });

                    $(document).delegate("#currency-update", "click", function(e) {
                        
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();

                        var $tag = $(this);
                        var $btn = $tag.button("loading");
                        var form = $($tag.data("form"));
                        var datatable = $tag.data("datatable");
                        form.find(".alert").remove();
                        var actionUrl = form.attr("action");
                        $http({
                            url: API_URL + "/_inc/" + actionUrl,
                            method: "POST",
                            data: form.serialize(),
                            cache: false,
                            processData: false,
                            contentType: false,
                            dataType: "json"
                        }).
                        then(function(response) {

                            $btn.button("reset");
                            var alertMsg = "<div class=\"alert alert-success\">";
                            alertMsg += "<p><i class=\"fa fa-check\"></i> " + response.data.msg + ".</p>";
                            alertMsg += "</div>";
                            form.find(".box-body").before(alertMsg);

                            // Alert
                            window.swal({
                              title: "Success!",
                              text: response.data.msg,
                              icon: "success",
                              buttons: true,
                              dangerMode: false,
                            })
                            .then(function (willDelete) {
                                if (willDelete) {
                                    $scope.closeCurrencyEditModal();
                                    $(document).find(".close").trigger("click");
                                    currencyId = response.data.id;
                                    
                                    $(datatable).DataTable().ajax.reload(function(json) {
                                        if ($("#row_"+currencyId).length) {
                                            $("#row_"+currencyId).flash("yellow", 5000);
                                        }
                                    }, false);

                                } else {
                                    $(datatable).DataTable().ajax.reload(null, false);
                                }
                            });

                        }, function(response) {

                            $btn.button("reset");

                            var alertMsg = "<div class=\"alert alert-danger\">";
                            window.angular.forEach(response.data, function(value, key) {
                                alertMsg += "<p><i class=\"fa fa-warning\"></i> " + value + ".</p>";
                            });
                            alertMsg += "</div>";
                            form.find(".box-body").before(alertMsg);

                            $(":input[type=\"button\"]").prop("disabled", false);

                            window.swal("Oops!", response.data.errorMsg, "error");
                        });

                    });

                    $scope.closeCurrencyEditModal = function () {
                        $uibModalInstance.dismiss("cancel");
                    };
                },
                scope: $scope,
                size: "md",
                backdrop  : "static",
                keyboard: true,
            });

            uibModalInstance.result.catch(function () { 
                uibModalInstance.close(); 
            });
        };
    }]);