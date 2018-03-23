import Composer from 'discourse/models/composer';
import ComposerActionTitle from 'discourse/components/composer-action-title';
import {withPluginApi} from 'discourse/lib/plugin-api';
import computed from 'ember-addons/ember-computed-decorators';
export default {name: 'df-ask', initialize() {withPluginApi('0.1', api => {
	// 2016-12-21 https://guides.emberjs.com/v2.4.0/object-model/reopening-classes-and-instances
	Composer.reopen({
		/**
		 * 2018-03-23
		 * @override
		 * https://github.com/discourse/discourse/blob/90af1659/app/assets/javascripts/discourse/models/composer.js.es6#L457-L557
		 * @param opts
		 */
		open(opts) {
			this.set('dfActionTitle', opts.dfActionTitle);
			return this._super(opts);
		},
		/**
		 * 2018-03-23
		 * @override
		 * https://github.com/discourse/discourse/blob/90af1659/app/assets/javascripts/discourse/models/composer.js.es6#L191-L240
		 * @param {String} action
		 * @param post
		 * @param topic
		 * @param topicTitle
		 */
		@computed('action', 'post', 'topic', 'topic.title')
		replyOptions(action, post, topic, topicTitle) {return Object.assign(
			this._super(action, post, topic, topicTitle), {dfActionTitle: this.get('dfActionTitle')}
		);}
	});
	ComposerActionTitle.reopen({
	   /**
		* 2018-03-23
		* @override
		* https://github.com/discourse/discourse/blob/90af1659/app/assets/javascripts/discourse/components/composer-action-title.js.es6#L17-L40
		* @param {Object} opts
		* @param {String} action
		*/
		@computed('options', 'action')
		actionTitle(opts, action) {return opts.dfActionTitle || this._super(opts, action);}
	});	
});}};