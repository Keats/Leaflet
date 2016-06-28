/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */


/* @namespace Marker
 * @section Interaction handlers
 *
 * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
 *
 * ```js
 * marker.dragging.disable();
 * ```
 *
 * @property dragging: Handler
 * Marker dragging handler (by both mouse and touch).
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		console.log('MarkerDrag initialize');
		this._marker = marker;
	},

	addHooks: function () {
		console.log('MarkerDrag addHooks');

		var icon = this._marker._icon;

		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon, true);
		}

		this._draggable.on({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).enable();

		L.DomUtil.addClass(icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		console.log('MarkerDrag removeHooks');

		this._draggable.off({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).disable();

		if (this._marker._icon) {
			L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
		}
	},

	moved: function () {
		console.log('MarkerDrag moved');

		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		// @section Dragging events
		// @event dragstart: Event
		// Fired when the user starts dragging the marker.

		// @event movestart: Event
		// Fired when the marker starts moving (because of dragging).
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
		if (this._marker._map._rotate){
			this._draggable.updateMapBearing(this._marker._map._bearing);	
		}
	},

	_onDrag: function (e) {
		console.log('MarkerDrag _onDrag');

		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		if (marker._map._rotate) {
			var iconAnchor = marker.options.icon.options.iconAnchor;
			L.DomUtil.setPosition(marker._icon, iconPos, -marker._map._bearing, iconPos.add(iconAnchor));
		}

		// update shadow position
		if (shadow) {
			if (marker._map._rotate) {
				var shadowAnchor = marker.options.icon.options.shadowAnchor ? iconPos.add(marker.options.icon.options.shadowAnchor) : iconPos.add(iconAnchor);
				L.DomUtil.setPosition(shadow, iconPos, -marker._map._bearing || 0, shadowAnchor);
			} else {
				L.DomUtil.setPosition(shadow, iconPos);
			}
		}

		marker._latlng = latlng;
		e.latlng = latlng;

		// @event drag: Event
		// Fired repeatedly while the user drags the marker.
		marker
		    .fire('move', e)
		    .fire('drag', e);
	},

	_onDragEnd: function (e) {
		// @event dragend: DragEndEvent
		// Fired when the user stops dragging the marker.

		// @event moveend: Event
		// Fired when the marker stops moving (because of dragging).
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});
