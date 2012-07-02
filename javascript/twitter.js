/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core', 'http://widgets.twimg.com/j/2/widget.js'], function($, sakai) {

    /**
     * @name sakai.twitter
     *
     * @class twitter
     *
     * @description
     * twitter is a widget that embeds a twitter feed using the twitter API
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.twitter = function(tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var DEFAULT_INPUT = 'sakaiproject';

        // DOM jQuery Objects
        var $rootel = $('#' + tuid); //unique container for each widget instance
        var $mainContainer = $('#twitter_main', $rootel);
        var $settingsContainer = $('#twitter_settings', $rootel);
        var $settingsForm = $('#twitter_settings_form', $rootel);
        var $cancelSettings = $('#twitter_cancel_settings', $rootel);
        var $profileRB = $('#twitter_widget_type_profile', $rootel);
        var $searchRB = $('#twitter_widget_type_search', $rootel);
        var $profileText = $('#twitter_profile_text', $rootel);
        var $searchText = $('#twitter_search_text', $rootel);
        var $profileQuery = $('#twitter_profile_or_query', $rootel);

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Checks if the provided profile or query is non-empty and returns it
         * if that is the case. If it is empty it returns the DEFAULT_INPUT
         *
         * @param {String} profileQuery The profile or query
         */
        var checkInput = function(profileQuery) {
            return (profileQuery && $.trim(profileQuery)) ? $.trim(profileQuery) : DEFAULT_INPUT;
        };


        /**
         * Gets the profile/query from the server using an asynchronous request
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the preferred profile or channel.
         */
        var getPreferredInput = function(callback) {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    callback(checkInput(data.profileQuery), data.profileRB);
                } else {
                    // fetching the data failed, we use the DEFAULT_COLOR
                    callback(DEFAULT_INPUT, true);
                }
            });
        };

        /////////////////////////
        // Main View functions //
        /////////////////////////

        /**
         * Shows the Main view that contains the twitter widget
         *
         * @param {String} profileQuery The profile name or query
         * @param {String} widgetType Is it a profile or a search widget
         */

        var showMainView = function(profileQuery, profileRB) {
            var widgetID = 'twitter_actual_widget_' + tuid;
            $mainContainer.html('<div id="' + widgetID + '"> </div>');
            if (profileRB){
                new TWTR.Widget({
                    version: 2,
                    id: widgetID,
                    type: 'profile',
                    rpp: 4,
                    interval: 30000,
                    width: 270,
                    height: 320,
                    theme: {
                        shell: {
                            background: '#E4E4E4',
                            color: '#666666'
                        },
                        tweets: {
                          background: '#ffffff',
                          color: '#424242',
                          links: '#2683BC'
                        }
                    },
                    features: {
                        scrollbar: true,
                        loop: false,
                        live: true,
                        behavior: 'all'
                    }
                }).render().setUser(profileQuery).start();

            }
            else {

                new TWTR.Widget({
                    version: 2,
                    id: widgetID,
                    type: 'search',
                    search: profileQuery,
                    interval: 30000,
                    title: '',
                    subject: profileQuery,
                    width: 270,
                    height: 320,
                    theme: {
                        shell: {
                            background: '#E4E4E4',
                            color: '#666666'
                        },
                        tweets: {
                            background: '#ffffff',
                            color: '#424242',
                            links: '#2683BC'
                        }
                    },
                    features: {
                        scrollbar: true,
                        loop: false,
                        live: true,
                        behavior: 'all'
                    }
                }).render().start();

            }
            $mainContainer.show();

        }


        /////////////////////////////
        // Settings View functions //
        /////////////////////////////

        /**
         * Sets the Settings view to the right settings
         *
         * @param {String} profileQuery The profile or query string
         * @param {Boolean} profileRB Is it a profile widget
         */
        var renderSettings = function(profileQuery, profileRB) {
            $profileQuery.val(checkInput(profileQuery));
            if (profileRB) {
                $profileText.show();
                $searchRB.removeAttr('checked');
                $profileRB.prop('checked', true);
            } else {
                $searchText.show();
                $profileRB.removeAttr('checked');
                $searchRB.prop('checked', true);
            }
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        $settingsForm.on('submit', function(ev) {
            // get the selected input
            var profileQuery = $profileQuery.val();
            var profileRB = $profileRB.is(':checked');

            // save the selected input
            sakai.api.Widgets.saveWidgetData(tuid, {
                profileQuery: profileQuery,
                profileRB: profileRB
            },
                function(success, data) {
                    if (success) {
                        // Settings finished, switch to Main view
                        sakai.api.Widgets.Container.informFinish(tuid, 'twitter');
                    }
                }
            );
            return false
        });

        $cancelSettings.on('click', function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'twitter');
        });

        $searchRB.on('click', function() {
            $searchText.show();
            $profileText.hide();
        });

        $profileRB.on('click', function() {
            $profileText.show();
            $searchText.hide();
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function() {
            if (showSettings) {
                getPreferredInput(renderSettings);

                $settingsContainer.show();
            } else {
                getPreferredInput(showMainView);
            }
        };

        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('twitter');
});
