/*
 * JsonTree plugin
 * Version 1.0
 *
 * Author: Erffun Havaasi
 *
 * License under the GPL-3.0
 * Dual licensed under the MIT and GPL licenses:
 * http://www.gnu.org/licenses/gpl.html
 * https://github.com/Erffun/JsonTree
 *
*/


(function ($) {
    $.fn.jsonTree = function (data, setting) {
        setting = $.extend({
            showCheckBox: false,
            checkBoxText: "Apply Sub Items",
            checkBoxElementName: "chkApplySub",
            checkBoxElementId: "chkApplySub",
            selectedIdElementName: "hdnSelected",
            selectedItemId: 0,
            selectedItemIsChecked: false,
            mandatorySelect: false,
            lazyLoad: false,
            lazyRequestUrl: '',
            lazySendParameterName: 'id',
            lazyLoadMethod:"GET",
            forceCreate:false,
            onSelect: function (selectedId, selectedLi, $clickedLi) { }
        }, setting);

        var $this = $(this);
        var levelClass = ["icon-folder-open", "icon-minus-sign"];

        function createTree(jsonData, $ul) {

            if (jsonData) {
                if ($.isArray(jsonData)) {
                    for (i = 0; i < jsonData.length; i++) {
                        createTreeItem(jsonData[i], $ul);
                    }
                }
                else {
                    createTreeItem(jsonData, $ul);
                }
            }
            return $ul;
        }

        function createTreeItem(jsonData, $ul) {
            var $li = $("<li></li>");
            if (jsonData.Title && jsonData.ItemId) {
                var $span = $("<span></span>").appendTo($li);
                var $icon = $("<i></i>").appendTo($span);
                $span.append(jsonData.Title);
                $li.data("additional", jsonData.AdditionalData);
                $li.attr("value", jsonData.ItemId);
                if ((jsonData.Items && jsonData.Items.length) || jsonData.HasSubItem) {

                    if (setting.lazyLoad && jsonData.HasSubItem) {
                        $li.addClass("parent_li");
                        $icon.addClass("icon-plus-sign");
                        var ajaxSendData = {};
                        ajaxSendData[setting.lazySendParameterName] = jsonData.ItemId;
                        $icon.click(function () {
                            $.ajax({
                                type:setting.lazyLoadMethod ,
                                url: setting.lazyRequestUrl,
                                data: ajaxSendData,
                                dataType: 'json',
                            }).done(function (data) {
                                if (data) {
                                    var $ajaxInnerUl = $("<ul></ul>");
                                    createTree(data, $ajaxInnerUl);
                                    $li.append($ajaxInnerUl);
                                    $icon.unbind("click");
                                }
                            }).fail(function(data){
                            	alert(data);
                            });
                        });
                    }



                    if (jsonData.Items && jsonData.Items.length) {
                        var $innerUl = $("<ul></ul>");
                        $(jsonData.Items).each(function () {
                            createTree(this, $innerUl);
                        });
                        $li.append($innerUl);
                    }
                }

                $ul.append($li);
            }
        }

        function removeSelectedClass($el) {
            $el.removeClass('selectedItem');
        }

        if (setting.forceCreate || !$this.data('treeView')) {
            var $ul = $("<ul></ul>");
            createTree(data, $ul);
            $this.addClass('tree').html($ul);
            $this.append($("<input type='hidden' />").attr("name", setting.selectedIdElementName));

            var $hasSubElements = $('li:has(ul)', $this);
            $hasSubElements.addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
            $hasSubElements.find(' > span i').addClass(levelClass[1]);

            $('ul', $this).on('click', 'li > span', function (e) {
                var $clickedItem = $(this);
                var $closestLi = $clickedItem.closest("li");
                if ($closestLi.hasClass("parent_li") && e.target && e.target.nodeName == "I") {
                    var children = $clickedItem.parent('li.parent_li').find(' > ul > li');
                    if (children.is(":visible")) {
                        children.hide('fast');
                        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
                    } else {
                        children.show('fast');
                        $clickedItem.attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
                    }
                } else {
                    if (!$clickedItem.hasClass('selectedItem')) {
                        removeSelectedClass($('span', $this));
                        $('input:checkbox[id="' + setting.checkBoxElementId + '"],label[for="' + setting.checkBoxElementId + '"]', $this).remove();
                        $clickedItem.addClass('selectedItem');
                        $this.data("selectedItem", $closestLi.val());
                        $('input[name="' + setting.selectedIdElementName + '"]').val($closestLi.val());
                        $this.val($closestLi.val());
                        if (setting.showCheckBox) {
                            var $check = $("<label for='" + setting.checkBoxElementId + "' ><input type='checkbox' value='true' id='" + setting.checkBoxElementId + "' name='" + setting.checkBoxElementName + "' /><inpute type='hidden' name='" + setting.checkBoxElementName + "' value='false'>" + "<small>" + setting.checkBoxText + "</small>" + "</label>");
                            if (setting.selectedItemId > 0 && setting.selectedItemIsChecked == "True") {
                                $($check.find("input[type='checkbox']")[0]).attr('checked', 'true');
                            }
                            $check.insertAfter($clickedItem);
                        }

                    }
                    if (setting.onSelect) {
                        setting.onSelect($closestLi.val(), $closestLi, $clickedItem);
                    }
                }

                e.stopPropagation();
            });
            var $selectElement;
            if (setting.selectedItemId > 0) {
                $selectElement = $("li[value='" + setting.selectedItemId + "'] > span", $this);
            } else {
                if (setting.mandatorySelect) {
                    $selectElement = $('li > span:first', $this);
                }
            }

            if ($selectElement) {
                $selectElement.trigger('click');
            }

            $this.data('treeView', $this);
        }


    };
})(jQuery);