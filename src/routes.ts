import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from 'zod'

interface updateMovieRequest {
  title?: string,
  release_date?: string
}

interface createAndUpdateReviewRequest {
  description: string,
}

export async function appRoutes(app: FastifyInstance) {
  // Listar filmes
  app.get('/movies', async () => {
    try {
      const findAllMovies = await prisma.movie.findMany({
        include: {
          reviews: true
        }
      })

      const moviesWithReviewStatus = findAllMovies.map(movie => ({
        ...movie,
        reviewed: movie.reviews.length > 0 ? 'Filme avaliado' : 'Filme não avaliado'
      }))

      return moviesWithReviewStatus
    } catch (error) {
      console.error(error)
    }
    
  })

  // Criar filme
  app.post('/movie', async (req) => {
    const createMovieBody = z.object({
      title: z.string(),
      release_date: z.string()
    })

    const { title, release_date } = createMovieBody.parse(req.body)

    try {
      await prisma.movie.create({
        data: {
          title: title,
          release_date: new Date(release_date),
        }
      })
  
      return 'Filme criado!'
    } catch (error) {
      console.error(error)
    }
    
  })

  // Atualizar filme
  app.put('/movie/:id/update', async (req) => {
    const updateMovieParams= z.object({
      id: z.string().uuid(),
    })

    const { id } = updateMovieParams.parse(req.params)
    const { title, release_date } = req.body as updateMovieRequest

    try {
      const findMovie = await prisma.movie.findUnique({
        where: {
          id: id
        }
      })
    
      await prisma.movie.update({
        where: {
          id: id
        },
        data: {
          title: title ? title : findMovie?.title,
          release_date: release_date ? new Date(release_date) : findMovie?.release_date
        }
      })
  
      return 'Filme atualizado!'
    } catch (error) {
      console.error(error)
    }
    
  })

  // Deletar filme
  app.delete('/movie/:id/delete', async (req) => {
    const deleteMovieParams = z.object({
      id: z.string().uuid()
    })

    const { id } = deleteMovieParams.parse(req.params)

    try { 
      await prisma.review.deleteMany({
        where: {
          movieId: id
        }
      })
  
      await prisma.movie.delete({
        where: {
          id: id
        }
      })
  
      return 'Filme excluído!'
    } catch (error) {
      console.error(error)
    }
    
  })

  // Criar avaliação para um filme
  app.post('/review/:id', async (req) => {
    const createReviewParams = z.object({
      id: z.string().uuid()
    })

    const { id } = createReviewParams.parse(req.params)

    try {
      const findMovie = await prisma.movie.findUnique({
        where: {
          id: id
        }
      })
  
      const { description } = req.body as createAndUpdateReviewRequest
  
      await prisma.review.create({
        data: {
          movieId: id,
          description: description
        }
      })
  
      return `Avaliação para o filme ${findMovie?.title} criada!`
    } catch (error) {
      console.error(error)
    }
    
  })

  // Listar avaliações por ID de filme
  app.get('/reviews/:id', async (req) => {
    const listReviewsParams = z.object({
      id: z.string().uuid()
    })

    const { id } = listReviewsParams.parse(req.params)

    try {
      const findReviewsByMovieId = await prisma.review.findMany({
        where: {
          movieId: id
        }
      })
  
      return findReviewsByMovieId
    } catch (error) {
      console.error(error)
    }
    
  })

  // Atualizar alguma avaliação 
  app.patch('/review/:id/update', async (req) => {
    const updateReviewParams = z.object({
      id: z.string().uuid()
    })

    const { id } = updateReviewParams.parse(req.params)

    const { description } = req.body as createAndUpdateReviewRequest

    try {
      await prisma.review.update({
        where: {
          id: id
        }, 
        data: {
          description: description
        }
      })
  
      return `Avaliação atualizada!`
  
    } catch (error) {
      console.error(error)
    }
  
  })

  // Deletar avaliação
  app.delete('/review/:id/delete', async (req) => {
    const deleteReviewParams = z.object({
      id: z.string().uuid()
    })

    const { id } = deleteReviewParams.parse(req.params)

    try {
      await prisma.review.delete({
        where: {
          id: id
        }
      })
  
      return 'Avaliação excluída!'
    } catch (error) {
      console.error(error)
    }
     
  })

  // Deletar todas avaliações de um filme 
  app.post('/review/:id/delete', async (req) => {
    const deleteReviewsParams = z.object({
      id: z.string().uuid()
    })

    const { id } = deleteReviewsParams.parse(req.params)

    try {
      const findMovie = await prisma.movie.findUnique({
        where: {
          id: id
        }
      })
  
      await prisma.review.deleteMany({
        where: {
          movieId: id
        }
      })
  
      return `Todas avaliações do filme ${findMovie?.title} foram excluídas!`
    } catch (error) {
      console.error(error)
    }
    
  })
}