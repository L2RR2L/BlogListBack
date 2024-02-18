

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    if (blogs.length === 0) return 0

    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return blogs.reduce(reducer,0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return {}

    const result = blogs.sort((blog1,blog2) => blog2.likes - blog1.likes)

    
    return {
        title: result[0].title,
        author: result[0].author,
        likes: result[0].likes
    }
}


const mostBlogs = (blogs) => {

    if (blogs.length === 0) return {}

    const authorCount = new Map()

    blogs.forEach(blog => {
        const count = authorCount.get(blog.author)
        if (count === undefined) authorCount.set(blog.author,1)
        else authorCount.set(blog.author,count+1)
    })

    let maxV = -Infinity
    let author = 'author'

    authorCount.forEach((value,key) => {
        if (value > maxV){
            maxV = value
            author = key
        }
    })

    return {
        author: author,
        blogs: maxV
    }
}


const mostLikes = (blogs) => {

    if (blogs.length === 0) return {}

    const authorCount = new Map()

    blogs.forEach(blog => {
        const count = authorCount.get(blog.author)
        if (count === undefined) authorCount.set(blog.author,blog.likes)
        else authorCount.set(blog.author,count+blog.likes)
    })

    let maxV = -Infinity
    let author = 'author'

    authorCount.forEach((value,key) => {
        if (value > maxV){
            maxV = value
            author = key
        }
    })

    return {
        author: author,
        likes: maxV
    }
}




module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }