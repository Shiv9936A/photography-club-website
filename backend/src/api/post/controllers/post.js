// @ts-nocheck
'use strict';

const { factories } = require('@strapi/strapi');

const INTERNAL_SECRET = process.env.AUTH_SYNC_SECRET;
const PUBLIC_EVENT_LIMIT = 10;

const requireInternalRequest = (ctx) => {
    const receivedSecret = ctx.request.header['x-auth-sync-secret'];

    if (!INTERNAL_SECRET || receivedSecret !== INTERNAL_SECRET) {
        ctx.unauthorized('Unauthorized');
        return false;
    }

    return true;
};

const getPostSortValue = (post) => new Date(post.createdAt || post.updatedAt || 0).getTime();

const getEventKey = (post) =>
    post.event?.documentId ||
    post.event?.id ||
    post.event?.EventId ||
    post.category?.id ||
    'ungrouped';

const limitPublicPosts = (posts, limitPerGroup = PUBLIC_EVENT_LIMIT) => {
    const counts = new Map();
    const limited = [];

    [...posts]
        .sort((a, b) => getPostSortValue(b) - getPostSortValue(a))
        .forEach((post) => {
            const key = getEventKey(post);
            const count = counts.get(key) || 0;

            if (count >= limitPerGroup) {
                return;
            }

            counts.set(key, count + 1);
            limited.push(post);
        });

    return limited;
};

const filterVisiblePosts = (posts, access) => {
    if (access === 'private') {
        return posts;
    }

    const publicPosts = posts.filter((post) => post.visibility !== 'private');
    return limitPublicPosts(publicPosts);
};

const loadGalleryPosts = async (strapi, access, imageCountPredicate) => {
    const posts = await strapi.entityService.findMany(
        'api::post.post',
        {
            populate: {
                images: true,
                category: true,
                photographerAvatar: true,
                event: true,
            },
            sort: { createdAt: 'desc' },
        }
    );

    return filterVisiblePosts(posts, access).filter(imageCountPredicate);
};

module.exports = factories.createCoreController(
    'api::post.post',
    ({ strapi }) => ({
        async getPhotos(ctx) {
            if (!requireInternalRequest(ctx)) {
                return;
            }

            const access = ctx.query.access === 'private' ? 'private' : 'public';
            const photos = await loadGalleryPosts(
                strapi,
                access,
                (post) => post.images && post.images.length === 1
            );

            return { data: photos };
        },

        async getReels(ctx) {
            if (!requireInternalRequest(ctx)) {
                return;
            }

            const access = ctx.query.access === 'private' ? 'private' : 'public';
            const reels = await loadGalleryPosts(
                strapi,
                access,
                (post) => post.images && post.images.length > 1
            );

            return { data: reels };
        },

        async likePost(ctx) {
            const { documentId } = ctx.params;

            if (!documentId) return ctx.badRequest("Missing documentId");

            const curr_post = await strapi.documents("api::post.post").findOne(
                {
                    documentId,

                    fields: ["likesCount"]
                }
            );

            if (!curr_post) return ctx.notFound("post not found");

            const updatePost = await strapi.documents("api::post.post").update({
                documentId,

                data: {
                    likesCount: (curr_post.likesCount || 0) + 1,
                },
            }
            );

            return { data: updatePost };
        },

    })
);
