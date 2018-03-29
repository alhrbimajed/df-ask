import ComposerModel from 'discourse/models/composer';
import ComposerActionTitle from 'discourse/components/composer-action-title';
import ComposerController from 'discourse/controllers/composer';
import {withPluginApi} from 'discourse/lib/plugin-api';
import computed from 'ember-addons/ember-computed-decorators';
export default {name: 'df-ask', initialize() {withPluginApi('0.1', api => {
	// 2018-03-29
	ComposerModel.serializeOnCreate('custom_fields');
	// 2016-12-21 https://guides.emberjs.com/v2.4.0/object-model/reopening-classes-and-instances
	ComposerModel.reopen({
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
			this._super(action, post, topic, topicTitle), {dfActionTitle: this.get('metaData.df.actionTitle')}
		);},
		serialize(serializer, r) {
			const m = this.get('metaData.df');
			this._super(serializer, r);
			if (m) {
				// 2018-03-29
				// This code adds the `df_ask__recipient` custom field to the current topic.
				// If you need to add it to the current post, then use the following code instead:
				//		r.custom_fields = _.extend(r.custom_fields || {}, {df_ask__recipient: m.recipient});
				// The `r.custom_fields` syntax will not add the custom field to the topic:
				// it will add it to the post only.
				var metaData = r.get('metaData') || r.metaData || Ember.Object.create();
				metaData.set('df_ask__recipient', m.recipient);
				r.set('metaData', metaData);
				// 2018-03-28
				// «User mention come in the beginning of the text question.
				// Can we make it after it (in the end of the text)?»
				// https://github.com/discourse-pro/df-ask/issues/1
				const mention = (content, d) => [content, d, d,
					// 2018-03-28
					// «As mentioned in image there should be a sentence saying "question to"
					// (This sentence will be translated)»:
					// https://github.com/discourse-pro/df-ask/issues/2
					I18n.t('df_ask.mention', {name: '@' + m.recipient})
				].join('');
				if (r.raw) {
					r.raw = mention(r.raw.trim(), "\n");
				}
				if (r.cooked) {
					// 2018-03-28 The cookied text is already trimmed.
					r.cooked = mention(r.cooked, '<br/>');
				}
			}
			return r;
		}
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
	ComposerController.reopen({
	   /**
		* 2018-03-23
		* @override
		* https://github.com/discourse/discourse/blob/90af1659/app/assets/javascripts/discourse/controllers/composer.js.es6#L138-L145
		* @param {Boolean} canEditTitle
		* @param {Boolean} creatingPrivateMessage
		* @returns {Boolean}
		*/
		@computed('model.canEditTitle', 'model.creatingPrivateMessage')
		canEditTags(canEditTitle, creatingPrivateMessage) {return(
			!this.get('model.metaData.df') && this._super(canEditTitle, creatingPrivateMessage)
		);}
	});
});}};