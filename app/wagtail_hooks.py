from wagtail import hooks
from wagtail.admin.rich_text.editors.draftail import features as DF


@hooks.register("register_rich_text_features")
def register_code_styling_feature(features):
    feature_name = "highlight"
    type_ = "HIGHLIGHT"
    tag = "highlight"
    icon_ = "highlight"

    control = {
        "type": type_,
        "icon": icon_,
        "description": "HIGHLIGHT",
        "element": tag,
        "style": {"display": "inline", "whiteSpace": "pre-wrap"},
    }

    features.register_editor_plugin(
        "draftail", feature_name, DF.InlineStyleFeature(control)
    )

    features.default_features.append(feature_name)
