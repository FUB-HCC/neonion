from django.conf import settings
import logging
import time as t
import logging
import json

logger = logging.getLogger(__name__)


# Annotation created
def log_annotation_created(request):
    if settings.USER_LOGGING_ENABLED:
        annotation = json.loads(request.body)
        user = request.user.email

        # Comment
        if annotation['oa']['motivatedBy'] == 'oa:commenting':
            comment_quote = annotation['quote']
            comment_content = annotation['oa']['hasBody']['chars']
            documentID = annotation['uri']
            logger.info('comment_created=%s, user=%s, text=%s, documentID=%s' % (
                comment_content, user, comment_quote, documentID))
            pass
            # TODO
        # Highlight
        elif annotation['oa']['motivatedBy'] == 'oa:highlighting':
            documentID = annotation['uri']
            highlight_content = annotation['quote']
            logger.info('highlight_created=_%s, user=%s, text=%s, documentID=%s' % (
            highlight_content, user, highlight_content, documentID))
            pass
            # TODO
        # Concept tag - Classifying
        elif annotation['oa']['motivatedBy'] == 'oa:classifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            logger.info('tag_concept_created=%s, user=%s, Concept_label=%s_, motivation=classifying_, documentID=%s' % (
                tag_content, user, tag_label, documentID))
            pass
            # TODO
        # concept tag - identifying
        elif annotation['oa']['motivatedBy'] == 'oa:identifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            identificated_as = annotation['oa']['hasBody']['identifiedAs']
            logger.info('tag_concept_created=%s, user=%s, Concept_label=%s_, motivation=identifying_, documentID=%s' % (
            tag_content, user, tag_label, documentID))
            pass
            # TODO
        # Linking between the concept tags
        elif annotation['oa']['motivatedBy'] == 'oa:linking':
            documentID = annotation['uri']
            source = annotation['neonion']['viewer']['source']
            target = annotation['neonion']['viewer']['target']
            predicateLabel = annotation['neonion']['viewer']['predicateLabel']
            logger.info(
                'link_created, user=%s, predicateLabel=%s_, source=%s, target=%s, motivation=linking_, documentID=%s' % (
                user, predicateLabel, source, target, documentID))
            pass


# Annotation edited
def log_annotation_edited(request):
    if settings.USER_LOGGING_ENABLED:
        annotation = json.loads(request.body)
        user = request.user.email
        # Comment
        if annotation['oa']['motivatedBy'] == 'oa:commenting':
            documentID = annotation['uri']
            comment_quote = annotation['quote']
            comment_content = annotation['oa']['hasBody']['chars']
            logger.info('comment_edited=%s, user=%s, text=%s, documentID=%s' % (
            comment_content, user, comment_quote, documentID))
            pass
            # TODO
        # Concept tag - Classifying
        elif annotation['oa']['motivatedBy'] == 'oa:classifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            logger.info('tag_concept_edited=%s, user=%s, Concept_label=%s_, motivation=classifying_, documentID=%s' % (
            tag_content, user, tag_label, documentID))
            pass
            # TODO
        # concept tag - identifying
        elif annotation['oa']['motivatedBy'] == 'oa:identifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            identificated_as = annotation['oa']['hasBody']['identifiedAs']
            logger.info('tag-concpt_edited=%s, user=%s, Concept_label=%s_, motivation=identifying_, documentID=%s' % (
            tag_content, user, tag_label, documentID))
            pass
            # TODO


def log_annotation_deleted(request):
    if settings.USER_LOGGING_ENABLED:
        annotation = json.loads(request.body)
        user = request.user.email
        # Comment
        if annotation['oa']['motivatedBy'] == 'oa:commenting':
            documentID = annotation['uri']
            comment_quote = annotation['quote']
            comment_content = annotation['oa']['hasBody']['chars']
            logger.info('comment_deleted=%s, user=%s, text: %s, documentID=%s' % (
            comment_content, user, comment_quote, documentID))
            pass
            # TODO
        # Highlight
        elif annotation['oa']['motivatedBy'] == 'oa:highlighting':
            documentID = annotation['uri']
            highlight_content = annotation['quote']
            logger.info('highlight_deleted=_%s, user=%s, text=%s, documentID=%s' % (
            highlight_content, user, highlight_content, documentID))
            pass
            # TODO
        # Concept tag - Classifying
        elif annotation['oa']['motivatedBy'] == 'oa:classifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            logger.info('tag_concept_deleted=%s, user=%s, Concept_label=%s_, motivation=classifying_, documentID=%s' % (
            tag_content, user, tag_label, documentID))
            pass
            # TODO
        # concept tag - identifying
        elif annotation['oa']['motivatedBy'] == 'oa:identifying':
            documentID = annotation['uri']
            tag_label = annotation['neonion']['viewer']['conceptLabel']
            tag_content = annotation['oa']['hasBody']['label']
            identificated_as = annotation['oa']['hasBody']['identifiedAs']
            logger.info('tag_concept_deleted=%s, user=%s, Concept_label=%s_, motivation=identifying_, documentID=%s' % (
            tag_content, user, tag_label, documentID))
            pass
            # TODO
        # Linking between the concept tags
        elif annotation['oa']['motivatedBy'] == 'oa:linking':
            documentID = annotation['uri']
            source = annotation['neonion']['viewer']['source']
            target = annotation['neonion']['viewer']['target']
            predicateLabel = annotation['neonion']['viewer']['predicateLabel']
            logger.info(
                'link_deleted, user=%s, predicateLabel=%s_, source=%s, target=%s, motivation=linking_, documentID=%s' % (
                user, predicateLabel, source, target, documentID))
            pass
